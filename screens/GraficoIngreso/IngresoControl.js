import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { obtenerDatos } from './dataService';
import firebase from '../../database/firebase';
import { useRoute } from '@react-navigation/core';

import AnimalesSeLeyoList from '../GraficoIngreso/AnimalesSeLeyoList';
import AnimalesNoLeyoList from '../GraficoIngreso/AnimalesNoLeyoList';
import AnimalesAusentesList from '../GraficoIngreso/AnimalesAusentesList';
import AnimalesNuncaPasoList from '../GraficoIngreso/AnimalesNuncaPasoList';
import NoRegsTable from '../GraficoIngreso/AnimalesSecosNaNList';

function CustomBarChart({ data }) {
  const maxDataValue = Math.max(...data.map(item => item.value));

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              { height: item.value === 0 ? 1 : (item.value / maxDataValue) * 200 },
              { backgroundColor: item.color }
            ]}
          />

          <Text style={styles.barValue}>{item.value}</Text>
          <Text style={styles.barLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Grafico() {
  const [data, setData] = useState([]);
  const [secosNaNData, setSecosNaNData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animalesAusentes, setAnimalesAusentes] = useState([]);
  const [animalesNuncaPaso, setAnimalesNuncaPaso] = useState([]);
  const [animalesNoLeyo, setAnimalesNoLeyo] = useState([]);
  const [animalesSeLeyo, setAnimalesSeLeyo] = useState([]);
  const [selectedLists, setSelectedLists] = useState({
    seLeyo: false,
    noLeyo: false,
    ausentes: false,
    nuncaPaso: false,
    secosNaN: false
  });

  const [showInfoView, setShowInfoView] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState([]);

  const [cantidadAnimalesEnOrdeñe, setCantidadAnimalesEnOrdeñe] = useState(0);

  const route = useRoute();
  const { tambo } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener los datos del tambo
        const { parsedData, parsedNoRegsData } = await obtenerDatos(tambo);

        console.log('ARRAY ARRAY ARRAY', parsedNoRegsData);

        // Filtrar y mapear los datos relevantes para Secos/No Registrados
        const filteredSecosNaNData = parsedNoRegsData
          .filter(row => row.cells[1] !== 'RFID') // Filtrar encabezado
          .map(async (row) => {
            const RFID = row.cells[1]; // RFID del animal

            // Buscar en la colección animal de Firebase
            const animalSnapshot = await firebase.db.collection('animal').where('erp', '==', RFID).get();
            if (!animalSnapshot.empty) {
              const animalData = animalSnapshot.docs[0].data();
              const { rp, estrep, estpro, mbaja } = animalData;

              // Verificar si el animal tiene mbaja
              if (mbaja) {
                return {
                  RP: 'No Registrada', // Cambiado a 'No Registrada'
                  RFID,
                  estPro: 'No Registrada', // Cambiado a 'No Registrada'
                  estRep: 'No Registrada', // Cambiado a 'No Registrada'
                  mensaje: 'El animal no está registrado',
                };
              }
              return {
                RP: rp,
                RFID,
                estPro: estpro,
                estRep: estrep,
                mensaje: 'El animal está registrado',
              };
            }
            // Si no hay coincidencia en Firebase, devolver 'No Registrada'
            return {
              RP: 'No Registrada',
              RFID,
              estPro: 'No Registrada',
              estRep: 'No Registrada',
              mensaje: 'El animal no está registrado',
            };
          });

        // Esperar a que se resuelvan todas las promesas
        const results = await Promise.all(filteredSecosNaNData);
        // Filtrar resultados nulos
        const validResults = results.filter(result => result !== null);

        setData(parsedData); // Datos principales
        setSecosNaNData(validResults); // Guardar Secos/No Registrados

      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tambo]);





  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const seLeyo = data.filter(row => parseInt(row.DiasAusente) === 0);
      const noLeyo = data.filter(row => parseInt(row.DiasAusente) === 1);
      const ausentes = data.filter(row => parseInt(row.DiasAusente) >= 2);
      const nuncaPaso = data.filter(row => parseInt(row.DiasAusente) === -1);
      const filteredNuncaPaso = nuncaPaso.filter(row => !row.cells.includes('RFID'));

      console.log('SECOS NAN', secosNaNData);

      setAnimalesSeLeyo(seLeyo);
      setAnimalesNoLeyo(noLeyo);
      setAnimalesAusentes(ausentes);
      setAnimalesNuncaPaso(filteredNuncaPaso);
    }
  }, [data]);

  // Función para obtener la cantidad de animales en ordeñe
  const obtenerAnimalesEnOrdeñe = async () => {
    try {
      const animalSnapshot = await firebase.db.collection('animal')
        .where('idtambo', '==', tambo.id) // Asegúrate de que 'idtambo' es el campo correcto
        .where('estpro', '==', 'En Ordeñe')
        .where('fbaja', '==', '') // Filtrar aquellos que no tienen valor en fbaja
        .get();

      const animalesEnOrdeñe = animalSnapshot.docs.map(doc => doc.data());
      console.log("Animales en ordeñe encontrados:", animalesEnOrdeñe); // Verifica los resultados
      setCantidadAnimalesEnOrdeñe(animalesEnOrdeñe.length); // Contar la cantidad de animales en ordeñe
    } catch (error) {
      console.error("Error al obtener los animales en ordeñe:", error);
    }
  };

  // Llama a la función al cargar el componente o en el momento que desees
  useEffect(() => {
    obtenerAnimalesEnOrdeñe();
  }, [tambo]);

  const toggleList = (listType) => {
    setSelectedLists(prevSelected => ({
      ...prevSelected,
      [listType]: !prevSelected[listType]
    }));
  };

  const handleShowInfo = (animals, listType) => {
    // Si la lista seleccionada es secosNaN, pasamos la data correspondiente
    if (listType === 'secosNaN') {
      setSelectedAnimals({ animals: secosNaNData, listType });
    } else {
      setSelectedAnimals({ animals, listType });
    }
    setShowInfoView(true);
  };

  const handleCloseInfoView = () => {
    setShowInfoView(false);
    setSelectedAnimals([]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1b829b" />
        <Text style={styles.loadingText}>Obteniendo información...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error al cargar los datos: {error}</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No se pudo obtener el gráfico de ingreso</Text>
      </View>
    );
  }

  const chartData = [
    { label: 'SE LEYO', value: animalesSeLeyo.length, color: '#027200' },
    { label: 'NO SE LEYO', value: animalesNoLeyo.length, color: '#990000' },
    { label: 'AUSENTES', value: animalesAusentes.length, color: '#084d6e' },
    { label: 'NUNCA SE LEYO', value: animalesNuncaPaso.length, color: '#f08a0c' },
    { label: 'SECOS/NR', value: secosNaNData.length, color: '#2d3323' }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.animalesEnOrdeñeText}>
        Animales en ordeñe: {cantidadAnimalesEnOrdeñe}
      </Text>
      <Text style={styles.title}>{tambo?.nombre} - Control de Ingreso</Text>

      {/* Indicador textual de ayuda */}
      <Text style={styles.scrollHint}>
        Desliza hacia los lados para ver todas las categorías →
      </Text>

      {/* Scroll horizontal para el gráfico */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ paddingHorizontal: 10 }}>
          <CustomBarChart data={chartData} />
        </View>
      </ScrollView>



      <View style={styles.buttonsContainer}>
        {animalesSeLeyo.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#027200' }]}
            onPress={() => handleShowInfo(animalesSeLeyo, 'seLeyo')}
          >
            <Text style={styles.buttonText}>Ver Se Leyó ({animalesSeLeyo.length})</Text>
          </TouchableOpacity>
        )}
        {animalesNoLeyo.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#990000' }]}
            onPress={() => handleShowInfo(animalesNoLeyo, 'noLeyo')}
          >
            <Text style={styles.buttonText}>Ver No Se Leyó ({animalesNoLeyo.length})</Text>
          </TouchableOpacity>
        )}
        {animalesAusentes.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#084d6e' }]}
            onPress={() => handleShowInfo(animalesAusentes, 'ausentes')}
          >
            <Text style={styles.buttonText}>Ver Ausentes ({animalesAusentes.length})</Text>
          </TouchableOpacity>
        )}
        {animalesNuncaPaso.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f08a0c' }]}
            onPress={() => handleShowInfo(animalesNuncaPaso, 'nuncaPaso')}
          >
            <Text style={styles.buttonText}>Ver Nunca Se Leyó ({animalesNuncaPaso.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botón separado para "Secos/No Registrados" */}
      {secosNaNData.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2d3323', marginBottom: 20 }]}
          onPress={() => handleShowInfo(secosNaNData, 'secosNaN')}
        >
          <Text style={styles.buttonText}>Ver Secos/No Registrados ({secosNaNData.length})</Text>
        </TouchableOpacity>
      )}

      <View style={styles.listContainer}>
        {selectedLists.seLeyo && <AnimalesSeLeyoList animales={animalesSeLeyo} />}
        {selectedLists.noLeyo && <AnimalesNoLeyoList animales={animalesNoLeyo} />}
        {selectedLists.ausentes && <AnimalesAusentesList animales={animalesAusentes} />}
        {selectedLists.nuncaPaso && <AnimalesNuncaPasoList animales={animalesNuncaPaso} />}
        {selectedLists.secosNaN && <NoRegsTable animales={secosNaNData} />}
      </View>

      {showInfoView && (
        <View style={styles.infoView}>
          <Text style={styles.infoTitle}>Estado de {selectedAnimals.listType}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseInfoView}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
          <FlatList
            data={selectedAnimals.animals}
            keyExtractor={(item) => item.RFID}
            renderItem={({ item }) => (
              <View style={styles.infoItem}>
                {/* Condición para Secos/No Registrados */}
                {selectedAnimals.listType === 'secosNaN' && (
                  <>
                    <Text style={styles.textLabel}>RP: {item.RP}</Text>
                    <Text style={styles.textLabel}>eRP: {item.RFID}</Text>
                    <Text style={styles.textLabel}>Est. Pro: {item.estPro}</Text>
                    <Text style={styles.textLabel}>Est. Rep: {item.estRep}</Text>
                  </>
                )}
                {/* Condición para Ausentes */}
                {selectedAnimals.listType === 'ausentes' && (
                  <>
                    <Text style={styles.textLabel}>RP: {item.RP}</Text>
                    <Text style={styles.textLabel}>eRP: {item.RFID}</Text>
                    <Text style={styles.textLabel}>Días Ausentes: {item.DiasAusente}</Text>
                  </>
                )}
                {/* Condición para Se Leyó, No Se Leyó, Nunca Pasó */}
                {(selectedAnimals.listType === 'seLeyo' || selectedAnimals.listType === 'noLeyo' || selectedAnimals.listType === 'nuncaPaso') && (
                  <>
                    <Text style={styles.textLabel}>RP: {item.RP}</Text>
                    <Text style={styles.textLabel}>eRP: {item.RFID}</Text>
                  </>
                )}
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f4f8',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginVertical: 20,
    minWidth: 150 // <- Esto garantiza espacio para las barras
  },

  barContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  bar: {
    width: 40,
    borderRadius: 5,
  },
  barValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5, // Espacio entre la barra y el valor
  },
  barLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5, // Espacio entre la barra y la etiqueta
  },
  buttonsContainer: {
    marginVertical: 20,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2980b9',
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18, // Tamaño de fuente aumentado
    textTransform: 'uppercase',
    letterSpacing: 1.5, // Espaciado entre letras para mayor claridad
  },
  listContainer: {
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  infoView: {
    backgroundColor: '#f2f4f8',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  infoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#1b829b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  animalesEnOrdeñeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 10,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 10,
  },
  scrollHint: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },

});

export default Grafico;

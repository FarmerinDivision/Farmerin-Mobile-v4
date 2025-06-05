import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import { Parser } from 'htmlparser2'; // Importa Parser de htmlparser2
import firebase from '../database/firebase';
import { useRoute } from '@react-navigation/core';


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

  const route = useRoute();
  const { tambo } = route.params;

  useEffect(() => {
    const obtenerDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!tambo) {
          throw new Error("No se ha seleccionado un tambo");
        }
        const docSnapshot = await firebase.db.collection('tambo').doc(tambo.id).get();
        if (!docSnapshot.exists) {
          throw new Error("El documento del tambo no existe");
        }
        const racionesURL = docSnapshot.data().raciones;
        const noRegsURL = docSnapshot.data().noreg;

        if (!racionesURL || !noRegsURL) {
          throw new Error("Los campos raciones o noregs no contienen URLs válidas");
        }

        const [racionesResponse, noRegsResponse] = await Promise.all([
          axios.get(racionesURL),
          axios.get(noRegsURL)
        ]);

        const parsedData = parseHTMLTable(racionesResponse.data);
        setData(parsedData);

        const parsedNoRegsData = parseHTMLTable(noRegsResponse.data);
        setSecosNaNData(parsedNoRegsData);

      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [tambo, firebase]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setAnimalesAusentes(data.filter(row => parseInt(row.DiasAusente) >= 2));
      setAnimalesNuncaPaso(data.filter(row => parseInt(row.DiasAusente) === -1));
      setAnimalesNoLeyo(data.filter(row => parseInt(row.DiasAusente) === 1));
      setAnimalesSeLeyo(data.filter(animal => parseInt(animal.DiasAusente) === 0));
    }
  }, [data]);

  const toggleList = (listType) => {
    setSelectedLists(prevSelected => ({
      ...prevSelected,
      [listType]: !prevSelected[listType]
    }));
  };

  const parseHTMLTable = (html) => {
    const data = [];
    const parser = new Parser({
      onopentag(name, attributes) {
        if (name === 'tr') {
          data.push({});
        }
      },
      ontext(text) {
        if (data.length) {
          const currentRow = data[data.length - 1];
          if (!currentRow.cells) {
            currentRow.cells = [];
          }
          currentRow.cells.push(text.trim());
        }
      },
      onclosetag(tagname) {
        if (tagname === 'tr') {
          const lastRow = data[data.length - 1];
          if (lastRow && lastRow.cells) {
            const [RP, RFID, DiasAusente] = lastRow.cells;
            data[data.length - 1] = { RP, RFID, DiasAusente };
          }
        }
      }
    });
    parser.write(html);
    parser.end();
    return data;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Obteniendo información...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error al cargar los datos: {error}</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No se pudo obtener el gráfico de ingreso</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tambo?.nombre} - Animales En Ordeñe</Text>
      <BarChart
        data={{
          labels: ['SE LEYO', 'NO SE LEYO', 'AUSENTES', 'NUNCA SE LEYO', 'SECOS/NaN'],
          datasets: [{
            data: [
              animalesSeLeyo.length,
              animalesNoLeyo.length,
              animalesAusentes.length,
              animalesNuncaPaso.length,
              secosNaNData.length
            ],
            colors: ['#00913f', '#c81d11', '#084d6e', '#f08a0c', '#2d3323']
          }]
        }}
        width={350}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726'
          }
        }}
        style={styles.chart}
      />
      <View style={styles.buttonsContainer}>
        {animalesSeLeyo.length > 0 && (
          <Button
            title={`Ver Se Leyó (${animalesSeLeyo.length})`}
            onPress={() => toggleList('seLeyo')}
          />
        )}
        {animalesNoLeyo.length > 0 && (
          <Button
            title={`Ver No Se Leyó (${animalesNoLeyo.length})`}
            onPress={() => toggleList('noLeyo')}
          />
        )}
        {animalesAusentes.length > 0 && (
          <Button
            title={`Ver Ausentes (${animalesAusentes.length})`}
            onPress={() => toggleList('ausentes')}
          />
        )}
        {animalesNuncaPaso.length > 0 && (
          <Button
            title={`Ver Nunca Se Leyó (${animalesNuncaPaso.length})`}
            onPress={() => toggleList('nuncaPaso')}
          />
        )}
        {secosNaNData.length > 0 && (
          <Button
            title={`Ver Secos/NaN (${secosNaNData.length})`}
            onPress={() => toggleList('secosNaN')}
          />
        )}
      </View>
      <View style={styles.listContainer}>
        {selectedLists.seLeyo && <AnimalesSeLeyoList animales={animalesSeLeyo} />}
        {selectedLists.noLeyo && <AnimalesNoLeyoList animales={animalesNoLeyo} />}
        {selectedLists.ausentes && <AnimalesAusentesList animales={animalesAusentes} />}
        {selectedLists.nuncaPaso && <AnimalesNuncaPasoList animales={animalesNuncaPaso} />}
        {selectedLists.secosNaN && <AnimalesSecosNaNList animales={secosNaNData} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  buttonsContainer: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 20,
    width: '100%',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default Grafico;

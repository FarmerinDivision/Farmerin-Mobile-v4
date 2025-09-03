import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Modal, TouchableOpacity } from 'react-native';
import { autenticacion } from '../../database/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/core';
import { MovieContext } from "../Contexto"; // Ajustá el path si es necesario

export default function ListItem({ navigation }) {
  const user = autenticacion.currentUser;
  const { movies } = useContext(MovieContext);
  const [mostrarResumen, setMostrarResumen] = useState(false);


  const obtenerResumenAnimales = () => {
    let vacas = 0;
    let vaquillonas = 0;
    let vacasSecas = 0;
    let vacasOrdeñe = 0;
    let vaquillonasSecas = 0;
    let vaquillonasOrdeñe = 0;
    let crias = 0;

    movies.forEach((animal) => {
      const esVaca = animal.categoria?.toLowerCase().includes('vaca');
      const esVaquillona = animal.categoria?.toLowerCase().includes('vaquillona');

      if (esVaca) vacas++;
      if (esVaquillona) vaquillonas++;

      if (animal.estpro === "seca") {
        if (esVaca) vacasSecas++;
        if (esVaquillona) vaquillonasSecas++;
      } else if (animal.estpro === "En Ordeñe") {
        if (esVaca) vacasOrdeñe++;
        if (esVaquillona) vaquillonasOrdeñe++;
      } else if (animal.estpro === "cria") {
        if (esVaquillona) crias++;
      }
    });

    return {
      vacas,
      vaquillonas,
      vacasSecas,
      vacasOrdeñe,
      vaquillonasSecas,
      vaquillonasOrdeñe,
      crias
    };
  };

  return (
    <>
      {/* Botón moderno para ver el resumen */}
      <TouchableOpacity
        style={styles.botonResumen}
        onPress={() => setMostrarResumen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.botonResumenTexto}>VER RESUMEN DE ANIMALES</Text>
      </TouchableOpacity>






      {/* Modal moderno de resumen de animales */}
      <Modal
        visible={mostrarResumen}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarResumen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resumenModal}>
            <Text style={styles.resumenTitulo}>📋 Resumen de Animales</Text>

            {(() => {
              const resumen = obtenerResumenAnimales();
              return (
                <View style={styles.resumenLista}>
                  <Text style={styles.resumenItem}>🐄 Vacas Totales: <Text style={styles.valor}>{resumen.vacas}</Text></Text>
                  <Text style={styles.resumenItem}>Vacas Secas: <Text style={styles.valor}>{resumen.vacasSecas}</Text></Text>
                  <Text style={styles.resumenItem}>Vacas en Ordeñe: <Text style={styles.valor}>{resumen.vacasOrdeñe}</Text></Text>
                  <View style={styles.separatorLine} />
                  <Text style={styles.resumenItem}>🐄 Vaquillonas Totales: <Text style={styles.valor}>{resumen.vaquillonas}</Text></Text>
                  <Text style={styles.resumenItem}>Vaquillonas Secas: <Text style={styles.valor}>{resumen.vaquillonasSecas}</Text></Text>
                  <Text style={styles.resumenItem}>Vaquillonas en Ordeñe: <Text style={styles.valor}>{resumen.vaquillonasOrdeñe}</Text></Text>
                  <Text style={styles.resumenItem}>Crias: <Text style={styles.valor}>{resumen.crias}</Text></Text>
                </View>
              );
            })()}

            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={() => setMostrarResumen(false)}
            >
              <Text style={styles.botonCerrarTexto}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tituloEmpresa: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d00',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  botonesContainer: {
    gap: 10,
  },

  botonVerde: {
    backgroundColor: '#e6f9ef',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  botonVerdeTexto: {
    color: '#004d00',
    fontWeight: 'bold'
  },
  botonBlanco: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  botonBlancoTexto: {
    color: '#004d00',
    fontWeight: 'bold'
  },
  usuarioTexto: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10
  },

  botonResumen: {
    backgroundColor: '#1b829b',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  botonResumenTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumenModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  resumenTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1b829b',
    textAlign: 'center',
  },
  resumenLista: {
    width: '100%',
  },
  resumenItem: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  valor: {
    fontWeight: 'bold',
    color: '#1b829b',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '100%',
  },
  botonCerrar: {
    backgroundColor: '#1b829b',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  botonCerrarTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

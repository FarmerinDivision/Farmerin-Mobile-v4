import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Modal, TouchableOpacity } from 'react-native';
import { autenticacion } from '../../database/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/core';
import { MovieContext } from "../Contexto"; // Ajustá el path si es necesario

export default function ListItem({ navigation }) {
  const [alerta, setAlerta] = useState(false);
  const user = autenticacion.currentUser;
  const { movies } = useContext(MovieContext);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const deletex = () => {
    if (user) {
      user.delete().then(() => {
        // Usuario eliminado
      }).catch((error) => {
        console.log(error);
      });
    }
  };
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


      {/* Botón para eliminar cuenta */}
      <TouchableHighlight
        style={styles.botonRojo}
        underlayColor="#ffdddd"
        onPress={() => setAlerta(true)}
      >
        <Text style={styles.botonRojoTexto}>ELIMINAR CUENTA</Text>
      </TouchableHighlight>

      {/* Modal de confirmación de eliminación */}
      <Modal
        visible={alerta}
        transparent
        animationType="fade"
        onRequestClose={() => { }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡ATENCIÓN!</Text>
            <Text style={styles.modalMessage}>¿DESEA ELIMINAR LA CUENTA?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#c4c4c4', flex: 1, marginRight: 5 }]}
                onPress={() => setAlerta(false)}
              >
                <Text style={styles.modalButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#DD6B55', flex: 1, marginLeft: 5 }]}
                onPress={() => {
                  setAlerta(false);
                  deletex();
                  AsyncStorage.removeItem('usuario');
                  AsyncStorage.removeItem('nombre');
                  navigation.navigate('OnBoarding');
                }}
              >
                <Text style={styles.modalButtonText}>ACEPTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  botonRojo: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  botonRojoTexto: {
    color: '#cc0000',
    fontWeight: 'bold',
    fontSize: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    minWidth: 250,
    elevation: 5,
    width: 300,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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

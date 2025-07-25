import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Modal, TouchableOpacity } from 'react-native';
import { autenticacion } from '../../database/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/core';

export default function ListItem({ navigation }) {
  const [alerta, setAlerta] = useState(false);
  const user = autenticacion.currentUser;

  const deletex = () => {
    if (user) {
      user.delete().then(() => {
        // Usuario eliminado
      }).catch((error) => {
        console.log(error);
      });
    }
  };

  return (
    <>
      <TouchableHighlight
        style={styles.botonRojo}
        underlayColor="#ffdddd"
        onPress={() => setAlerta(true)}
      >
        <Text style={styles.botonRojoTexto}>ELIMINAR CUENTA</Text>
      </TouchableHighlight>
      <Modal
        visible={alerta}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¡ATENCION!</Text>
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
});

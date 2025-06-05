import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { encode } from 'base-64';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/core';
import firebase from '../../database/firebase';

export default ({ navigation }) => {
  
  const route = useRoute();
  const { tambo } = route.params;
  const { id, host } = tambo;

  const [tolvasDer, guardarTolvasDer] = useState([]);
  const [tolvasIzq, guardarTolvasIzq] = useState([]);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMover, setShowMover] = useState(false);
  const [racionMotor, setRacionMotor] = useState('');
  const [isOldVersion, setIsOldVersion] = useState(false);

  useEffect(() => {
    if (!global.btoa) {
      global.btoa = encode;
    }
    verificarVersionTambo();
    obtenerTolvas();
    obtenerRacionMotor();
  }, []);

  async function verificarVersionTambo() {
    try {
      const snapshot = await firebase.db.collection('tambo').doc(id).get();
      if (snapshot.exists) {
        const data = snapshot.data();
        console.log('Versión del tambo:', data.version);
        console.log('Tipo de dato de version:', typeof data.version);
        
        setIsOldVersion(String(data.version) === '0');
        console.log('isOldVersion:', String(data.version) === '0');
      }
    } catch (error) {
      console.log('Error verificando versión del tambo:', error);
      setIsOldVersion(true); // Por defecto, consideramos versión antigua si hay error
    }
  }

  async function obtenerTolvas() {
    setLoading(true);
    const url = 'http://' + host + '/tolvas';
    const login = 'farmerin';
    const password = 'Farmerin*2021';

    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const tolvas = await api.json();
      guardarTolvasIzq(tolvas.filter(tolva => tolva.Sector === 1));
      guardarTolvasDer(tolvas.filter(tolva => tolva.Sector === 2));
    } catch (error) {
      setError('Error al conectarse al tambo ' + error);
    } finally {
      setLoading(false);
    }
  }

  async function obtenerRacionMotor() {
    const url = 'http://' + host + '/racionMotor';
    const login = 'farmerin';
    const password = 'Farmerin*2021';

    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const r = await api.json();
      const rac = r[0].racion;
      setRacionMotor(isNaN(parseFloat(rac)) ? 2 : parseFloat(rac));
    } catch (error) {
      setRacionMotor(2);
    }
  }

  async function pruebaMotores() {
    setShowMover(false);
    const url = 'http://' + host + '/pruebaMotores';
    const login = 'farmerin';
    const password = 'Farmerin*2021';

    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const t = await api.json();
      alert(`Atención: ${t[0].mensaje}`);
    } catch (error) {
      alert('No hay conexión con el tambo');
    }
  }

  async function detenerPruebaMotores() {
    const url = 'http://' + host + '/detenerPruebaMotores';
    const login = 'farmerin';
    const password = 'Farmerin*2021';

    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      const response = await api.json();
      alert(`${response[0].mensaje || 'Motores detenidos correctamente'}`);
    } catch (error) {
      alert('Error al intentar detener los motores');
    }
  }
console.log('ID', id)
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color='#1b829b' />
      ) : (tolvasDer.length === 0 && tolvasIzq.length === 0) ? (
        <Text style={styles.alerta}>NO HAY CONEXION CON EL TAMBO {error}</Text>
      ) : (
        <>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.push('LadoTolva', { lado: 'IZQUIERDO', tolvas: tolvasIzq, host, racionMotor, tambo })}>
            <Icon name="chevron-left" size={50} color="#e1e8ee" />
            <Text style={styles.textBoton}>LADO IZQUIERDO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.boton} onPress={() => navigation.push('LadoTolva', { lado: 'DERECHO', tolvas: tolvasDer, host, racionMotor, tambo })}>
            <Icon name="chevron-right" size={50} color="#e1e8ee" />
            <Text style={styles.textBoton}>LADO DERECHO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonPB} onPress={() => setShowMover(true)}>
            <Icon name="refresh" size={50} color="#e1e8ee" />
            <Text style={styles.textBoton}>PRUEBA MOTORES</Text>
          </TouchableOpacity>

          {console.log('Estado actual de isOldVersion:', isOldVersion)}
          {!isOldVersion && (
            <TouchableOpacity style={styles.botonDet} onPress={detenerPruebaMotores}>
              <Icon name="stop" size={50} color="#e1e8ee" />
              <Text style={styles.textBoton}>DETENER MOTORES</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Modal animationType='fade' transparent={true} visible={showMover}>
        <View style={styles.center}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.text2}>DESEA MOVER TODOS LOS MOTORES?</Text>
            </View>
            <Button title=" MOVER MOTORES" type="outline" onPress={pruebaMotores} />
            <Button title=" CANCELAR" type="outline" onPress={() => setShowMover(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 15,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#287fbb',
    borderRadius: 8,
    marginVertical: 20, // Más espacio entre botones
    paddingVertical: 15, // Incrementa el espacio interno para mejor visualización
    paddingHorizontal: 30,
    width: '90%', // Ajustar el ancho al 90% de la pantalla
    justifyContent: 'center', // Centrar contenido dentro del botón
  },
  botonPB: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4cb14e',
    borderRadius: 8,
    marginVertical: 20, // Más espacio entre botones
    paddingVertical: 15, // Incrementa el espacio interno para mejor visualización
    paddingHorizontal: 30,
    width: '90%', // Ajustar el ancho al 90% de la pantalla
    justifyContent: 'center', // Centrar contenido dentro del botón
  },
  botonDet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#900000',
    borderRadius: 8,
    marginVertical: 20, // Más espacio entre botones
    paddingVertical: 15, // Incrementa el espacio interno para mejor visualización
    paddingHorizontal: 30,
    width: '90%', // Ajustar el ancho al 90% de la pantalla
    justifyContent: 'center', // Centrar contenido dentro del botón
  },
  textBoton: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  alerta: {
    textAlign: 'center',
    backgroundColor: '#FFBF5A',
    fontSize: 16,
    color: '#444',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  text2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';
import AwesomeAlert from 'react-native-awesome-alerts';
import firebase from '../../database/firebase'; // Asegúrate de importar tu configuración de Firebase

export default function ListItem({ data, host, racionMotor, tambo }) {
  const { Sector, Orden, SumaRaciones, MantTolva, IdModbus, IdMotor, kgMantenimiento } = data;
  const [estado, setEstado] = useState('REVISADO');
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });
  const [version, setVersion] = useState(null);

  useEffect(() => {
    if ((SumaRaciones - MantTolva) > kgMantenimiento) setEstado('MANTENIMIENTO');

    // Obtener la versión desde Firebase usando el id de tambo
    const obtenerVersion = async () => {
      try {
        const docRef =  firebase.db.collection('tambo').doc(tambo.id);
        const doc = await docRef.get();
        if (doc.exists) {
          const data = doc.data();
          setVersion(data.version);
        } else {
          console.log("No se encontró el documento.");
        }
      } catch (error) {
        console.error("Error al obtener la versión:", error);
      }
    };

    obtenerVersion();
  }, []);

  // Función para mover el motor
  async function mover() {
    const url = 'http://' + host + '/moverMotor/' + IdModbus + '&' + IdMotor + '&' + racionMotor;
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const t = await api.json();
      setAlerta({
        show: true,
        titulo: 'Atención!',
        mensaje: t[0].mensaje,
        color: '#3AD577'
      });
    } catch (error) {
      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: 'No se puede conectar al tambo',
        color: '#DD6B55'
      });
    }
  }

  // Función para detener el motor
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

  async function setRevisado() {
    const url = 'http://' + host + '/limpiarTolva/' + Orden + '&' + Sector;
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const t = await api.json();
      setEstado('REVISADO');
      setAlerta({
        show: true,
        titulo: 'Atención!',
        mensaje: t[0].mensaje,
        color: '#3AD577'
      });
    } catch (error) {
      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: 'No se puede conectar al tambo',
        color: '#DD6B55'
      });
    }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.text}>MOTOR: {Orden} </Text>

      {/* Botón para girar el motor */}
      <Button
        title="GIRAR MOTOR"
        style={styles.boton}
        type="outline"
        icon={<Icon name="refresh" size={25} color="#4cb14e" style={{margin: 5}} />}
        onPress={mover}
      />

      {/* Condicional para mostrar el botón detener según la versión */}
      {version === 1 && (
        <Button
          title="DETENER MOTOR"
          style={styles.boton}
          type="outline"
          icon={<Icon name="stop" size={25} color="#900000" style={{margin: 5}} />}
          onPress={detenerPruebaMotores}
        />
      )}

      {(estado === 'MANTENIMIENTO') ?
        <Pressable onPress={setRevisado}>
          <Text style={styles.boton2}>
            &nbsp;MANTENIMIENTO
          </Text>
        </Pressable>
        :
        <Text style={styles.revisada}>
          &nbsp;REVISADA
        </Text>
      }

      <AwesomeAlert
        show={alerta.show}
        showProgress={false}
        title={alerta.titulo}
        message={alerta.mensaje}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="ACEPTAR"
        confirmButtonColor={alerta.color}
        onConfirmPressed={() => setAlerta({ show: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15,
  },
  text: {
    fontSize: 18,
    color: '#2980B9',
    fontWeight: 'bold'
    
  },
  boton: {
    margin: 5,
    color: "#f194ff",
  },
  boton2: {
    backgroundColor: "#ff8000",
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 3,
    alignItems: 'center',
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  revisada: {
    backgroundColor: '#4cb14e',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 3,
    alignItems: 'center',
    textAlign: 'center',
    textAlignVertical: 'center'
  },
});

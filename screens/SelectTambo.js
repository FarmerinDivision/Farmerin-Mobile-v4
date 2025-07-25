import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, FlatList,  TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '../database/firebase';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ListItem from './ListItem';
import Modal from 'react-native-modal';

export default function App({ setShowTambos, showTambos, selectTambo }) {
  const [tambos, guardarTambos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({
     show: false,
     titulo: '',
     mensaje: '',
     color: '#287fb9'
  });
 
  useEffect(() => {
     console.log('Iniciando la obtención de tambos');
     obtenerTambos();
  }, []);
 
  async function obtenerTambos() {
     setLoading(true);
     console.log('Estado de carga:', loading);
     try {
       AsyncStorage.getItem('usuario').then((keyValue) => {
         try {
           firebase.db.collection('tambo').where('usuarios', 'array-contains', keyValue).orderBy('nombre', 'desc').onSnapshot(snapshotTambo);
         } catch (error) {
           setAlerta({
             show: true,
             titulo: '¡ ERROR !',
             mensaje: 'NO SE PUEDEN RECUPERAR LOS TAMBOS ASOCIADOS AL USUARIO',
             color: '#DD6B55'
           });
           setLoading(false);
           setShowTambos(false);
         }
       });
     } catch (error) {
       setAlerta({
         show: true,
         titulo: '¡ ERROR !',
         mensaje: 'NO SE PUEDEN RECUPERAR LOS TAMBOS ASOCIADOS AL USUARIO',
         color: '#DD6B55'
       });
       setLoading(false);
       setShowTambos(false);
     }
  }
 
  function snapshotTambo(snapshot) {
     const tambos = snapshot.docs.map(doc => {
       return {
         id: doc.id,
         ...doc.data()
       }
     })
     guardarTambos(tambos);
     console.log('Estado de carga después de obtener los tambos:', loading);
 
     if (tambos.length > 0) {
       if (tambos.length == 1) {
         selectTambo(tambos[0]);
         setShowTambos(false);
       }
     } else {
       setAlerta({
         show: true,
         titulo: '¡ ERROR !',
         mensaje: 'NO HAY TAMBOS ASOCIADOS AL USUARIO',
         color: '#DD6B55'
       });
       setShowTambos(false);
     }
     setLoading(false);
  }
 
  if (loading) {
     return (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <ActivityIndicator size="large" color="#287fb9" />
       </View>
     );
  }
 
  return (
    <>
      <Modal
        animationType='fade'
        transparent={true}
        visible={showTambos}

      >

        <View style={styles.center}>

          <View style={styles.content}>

            {loading ?
              <>
                <View style={styles.header}>
                  <Text style={styles.text2}>BUSCANDO TAMBOS...</Text>
                </View>
              </>
              :
              <>
                <View style={styles.header}>
                  <Text style={styles.text2}>SELECCIONE TAMBO</Text>
                </View>

                <FlatList
              data={tambos}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.card} 
                  onPress={() => {
                    selectTambo(item);
                    setShowTambos(false);
                  }}
                >
                  <Text style={styles.cardTitle}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
              </>
            }
          </View>
        </View>

      </Modal>
      {alerta && (
  <Modal
    isVisible={!!alerta}
    onBackdropPress={() => setAlerta(false)}
    onBackButtonPress={() => setAlerta(false)}
  >
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>¡ATENCIÓN!</Text>
      <Text style={{ marginVertical: 10 }}>¿DESEA ELIMINAR LA CUENTA?</Text>
      <Button
        title="ACEPTAR"
        onPress={() => setAlerta(false)}
        buttonStyle={{ backgroundColor: '#DD6B55', marginTop: 10 }}
      />
      <Button
        title="CANCELAR"
        onPress={() => setAlerta(false)}
        buttonStyle={{ backgroundColor: '#c4c4c4', marginTop: 10 }}
      />
    </View>
  </Modal>
)}
    </>

  );
}




const styles = StyleSheet.create({
  text2: {
    color: '#e1e8ee',
    backgroundColor: '#287fb9',
    textAlign: 'center',
    fontSize: 20, // Aumentado
    marginTop: 15, // Aumentado
    marginBottom: 15, // Aumentado
  },
  center: {
    flex: 1,
    justifyContent: 'center', // Centrar el contenido verticalmente
    alignItems: 'center', // Centrar horizontalmente
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    backgroundColor: '#287fb9',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 10, // Agrega más padding
  },
  content: {
    backgroundColor: '#e1e8ee',
    borderWidth: 1,
    borderColor: 'white',
    margin: 10, // Reducir márgenes laterales
    width: '90%', // Usar más espacio horizontalmente
    height: '60%', // Aumentar el tamaño del contenedor
    borderRadius: 15,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10, // Aumentar bordes redondeados
    paddingVertical: 15, // Aumentar espacio interno
    paddingHorizontal: 20, // Aumentar espacio interno
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Aumentar sombra
    shadowOpacity: 0.1,
    shadowRadius: 4, // Aumentar sombra
    elevation: 3, // Aumentar sombra en Android
    marginHorizontal: 5, // Aumentar separación horizontal
    marginVertical: 5, // Aumentar separación vertical
  },
  cardTitle: {
    fontSize: 16, // Aumentar tamaño del texto
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingVertical: 5, // Agrega más espacio al final de la lista
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 1, // Aumentar espacio entre elementos
  },
});
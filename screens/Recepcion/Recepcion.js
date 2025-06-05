import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useRoute } from '@react-navigation/core';


export default ({ navigation }) => {

  const route = useRoute();
  const {tambo} = route.params;
  const {usuario} = route.params;

  const [loading, setLoading] = useState(false);
  const [recepciones, setRecepciones] = useState('');
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {

    //busca los animales que no sean rechazados
    obtenerRecepcion();
  }, []);




  function obtenerRecepcion() {
    setLoading(true);
    try {
      firebase.db.collection('tambo').doc(tambo.id).collection('recepcion').orderBy('fecha', 'desc').limit(30).get().then(snapshotRecepcion)
    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ERROR!',
        mensaje: 'NO SE PUEDEN OBTENER LAS RECEPCIÓNES',
        color: '#DD6B55'
      });
    }
  }


  function snapshotRecepcion(snapshot) {
    const r = snapshot.docs.map(doc => {

      return {
        id: doc.id,
        ...doc.data()
      }

    })
    setRecepciones(r);
    setLoading(false);
  };

  function eliminarRecepcion(recepcion) {
    try {

      if (recepcion.foto.length > 0) {

        // Borra la foto
        const imageRef = firebase.almacenamiento.ref(tambo.id + '/recepciones/' + recepcion.foto);
        imageRef.delete();

      }

      const idRecep = recepcion.id;
      firebase.db.collection('tambo').doc(tambo.id).collection('recepcion').doc(idRecep).delete();
      const recep = recepciones.filter(r => {
        return (
          r.id != idRecep
        )
      });
      setRecepciones(recep);
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'RECEPCIÓN ELIMINADA',
        color: '#3AD577'
      });

    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ERROR!',
        mensaje: 'NO SE PUEDE ELIMINAR LA RECEPCIÓN',
        color: '#DD6B55'
      });
    }

  }
  
  return (
    <View style={styles.container}>
      <View style={styles.listado}></View>
  
      {loading || recepciones.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1b829b" />
        </View>
      ) : recepciones.length === 0 ? (
        <Text style={styles.alerta}>NO SE ENCONTRARON ANIMALES</Text>
      ) : (
        <FlatList
          data={recepciones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListItem
              data={item}
              eliminarRecepcion={() => eliminarRecepcion(item)}
            />
          )}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContainer}
        />
      )}
  
      <Button
        title="AGREGAR"
        icon={
          <Icon
            name="plus-square"
            size={25}
            color="white"
            style={styles.buttonIcon}
          />
        }
        onPress={() => {
          navigation.push('RegistrarRecepcion', {
            tambo: tambo,
            usuario: usuario,
          });
        }}
        buttonStyle={styles.button}
      />
  
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
        onCancelPressed={() => setAlerta({ show: false })}
        onConfirmPressed={() => setAlerta({ show: false })}
      />
    </View>
  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 16,
    color: '#444',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#1b829b',
    borderRadius: 8,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  listado: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 20,
  },
  separator: {
    height: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 50,
    fontSize: 16,
    color: '#1b829b',
  },
});
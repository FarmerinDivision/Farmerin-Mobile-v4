import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import Modal from 'react-native-modal';
import VerInfo from "./VerInfo";
import { useRoute } from '@react-navigation/core';


export default ({ navigation }) => {

  const route = useRoute();
  const {tambo} = route.params;
  
  const [loading, setLoading] = useState(false);
  const [producciones, setProducciones] = useState('');
  const [showTambos, setShowTambos] = useState(false);
  const [seleccionado, setSeleccionado] = useState({});
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {

    //busca los animales que no sean rechazados
    obtenerProduccion();
  }, []);




  function obtenerProduccion() {
    setLoading(true);
    try {
      firebase.db.collection('tambo').doc(tambo.id).collection('produccion').orderBy('fecha', 'desc').limit(30).get().then(snapshotProduccion)
    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ERROR!',
        mensaje: 'NO SE PUEDE OBTENER LA PRODUCCIÓN',
        color: '#DD6B55'
      });
    }
  }


  function snapshotProduccion(snapshot) {
    const p = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(prod => Object.keys(prod).length > 1); // Filtra los documentos sin datos
  
    setProducciones(p);
    setLoading(false);
  }
  

  function eliminarProduccion(produccion) {
    try {
      const idProd = produccion.id;
      firebase.db.collection('tambo').doc(tambo.id).collection('produccion').doc(idProd).delete();
      const pr = producciones.filter(p => {
        return (
          p.id != idProd
        )
      });
      setProducciones(pr);
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'PRODUCCIÓN ELIMINADA',
        color: '#3AD577'
      });
    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ERROR!',
        mensaje: 'AL ELIMINAR LA PRODUCCIÓN',
        color: '#DD6B55'
      });
    }

  }


  return (
    <View style={styles.container}>
    <View style={styles.listado}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1b829b" />
        </View>
      ) : producciones.length === 0 ? (
        <>
          <Text style={styles.alerta}>NO SE ENCONTRARON PRODUCCIONES</Text>
          <Button
            title="AGREGAR PRODUCCIÓN"
            icon={
              <Icon
                name="plus-square"
                size={25}
                color="white"
                style={styles.buttonIcon}
              />
            }
            onPress={() => navigation.push('RegistrarProduccion', { tambo })}
            buttonStyle={styles.button}
          />
        </>
      ) : (
        <>
          <FlatList
            data={producciones}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListItem
                data={item}
                eliminarProduccion={() => eliminarProduccion(item)}
                info={() => {
                  setShowTambos(true);
                  setSeleccionado(item);
                }}
              />
            )}
            ItemSeparatorComponent={Separator}
            contentContainerStyle={styles.listContainer}
          />
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
            onPress={() => navigation.push('RegistrarProduccion', { tambo })}
            buttonStyle={styles.button}
          />
        </>
      )}
    </View>

    {alerta.show && (
      <Modal
        isVisible={alerta.show}
        onBackdropPress={() => setAlerta({ ...alerta, show: false })}
        onBackButtonPress={() => setAlerta({ ...alerta, show: false })}
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: alerta.color }}>{alerta.titulo}</Text>
          <Text style={{ marginVertical: 10 }}>{alerta.mensaje}</Text>
          <Button
            title="ACEPTAR"
            onPress={() => {
              setAlerta({ ...alerta, show: false });
              if (alerta.vuelve) {
                navigation.popToTop();
              }
            }}
            buttonStyle={{ backgroundColor: alerta.color, marginTop: 10 }}
          />
        </View>
      </Modal>
    )}

    {showTambos && <VerInfo setShowTambos={setShowTambos} showTambos={showTambos} data={seleccionado} />}
  </View>

  );
}

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
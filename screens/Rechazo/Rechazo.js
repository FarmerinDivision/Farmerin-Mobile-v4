import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Button } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar } from 'react-native-elements';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const { movies } = useContext(MovieContext);

  const [animales, guardarAnimales] = useState([]);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [rp, guardarRP] = useState('');

  const route = useRoute();
  const { tambo } = route.params;
  const { estado } = route.params;
  const { usuario } = route.params;

  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');

  useEffect(() => {
    obtenerAnim();
  }, []);

  useEffect(() => {
    guardarAnimalesFilter(animales);
  }, [animales]);

  function updateSearch(rp) {
    if (rp) {
      const cond = rp.toLowerCase();
      const filtro = animales.filter(animal => {
        return (
          animal.rp.toString().toLowerCase().includes(cond)
        );
      });
      guardarAnimalesFilter(filtro);
      guardarRP(rp);
    } else {
      guardarAnimalesFilter(animales);
      guardarRP(rp);
    }
  }

  function obtenerAnim() {
    setLoading(true);
    try {
      firebase.db.collection('animal')
        .where('idtambo', '==', tambo.id)
        .where('fbaja', '==', '')
        .orderBy('rp')
        .get()
        .then(snapshotAnimal)
        .catch(error => {
          setAlerta('¡ERROR! NO SE PUEDEN OBTENER LOS ANIMALES');
        });
    } catch (error) {
      setAlerta('¡ERROR! NO SE PUEDEN OBTENER LOS ANIMALES');
    }
  }

  function snapshotAnimal(snapshot) {
    const an = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      };
    });

    function compare(a, b) {
      if (a.lactancia < b.lactancia) {
        return 1;
      }
      if (a.lactancia > b.lactancia) {
        return -1;
      }
      return 0;
    }

    an.sort(compare);
    guardarAnimales(an);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Buscar por RP"
        onChangeText={updateSearch}
        value={rp}
        lightTheme
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
      />
      <View style={styles.listado}>
        {loading || animalesFilter.length === 0 ?(
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color='#1b829b' />
          </View>
        ) :  (animalesFilter.length === 0 && !animales.length) ? (
          <Text style={styles.alerta}>NO SE ENCONTRARON ANIMALES</Text>
        ) : (
          <FlatList
            data={animalesFilter}
            keyExtractor={item => item.id}
            initialNumToRender={100}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <ListItem
                data={item}
                registrarRechazo={() => {
                  navigation.push('RegistrarRechazo', {
                    animal: item,
                    usuario: usuario,
                  })
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
      )}
      </View>
      {alerta && (
        <Modal
          isVisible={!!alerta}
          onBackdropPress={() => setAlerta('')}
          onBackButtonPress={() => setAlerta('')}
        >
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>¡ATENCIÓN!</Text>
            <Text style={{ marginVertical: 10 }}>{alerta}</Text>
            <Button
              title="ACEPTAR"
              onPress={() => setAlerta('')}
              buttonStyle={{ backgroundColor: '#DD6B55', marginTop: 10 }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#f7f7f7',
      paddingHorizontal: 3,
      paddingVertical: 3,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 5,
    borderWidth: 0,
  },
  searchInput: {
    backgroundColor: '#f1f3f6',
    borderRadius: 10,
    paddingHorizontal: 10,


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
  listContainer: {
    paddingBottom: 60, // Adding padding for the button
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
    marginTop: 10,
    fontSize: 16,
    color: '#1b829b',
  },
});

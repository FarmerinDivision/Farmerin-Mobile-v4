import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Button } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar } from 'react-native-elements';
import differenceInDays from 'date-fns/differenceInDays';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const { movies } = useContext(MovieContext)
  const [animales, guardarAnimales] = useState([]);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [rp, guardarRP] = useState('');

  const route = useRoute();
  const {tambo} = route.params;
  const {estado} = route.params;
  const {usuario} = route.params;

  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {

    //busca los animales que no sean rechazados
    obtenerAnim();
  }, []);

  useEffect(() => {
    guardarAnimalesFilter(animales);
  }, [animales])

  function updateSearch(rp) {
    if (rp) {
      const cond = rp.toLowerCase();
      const filtro = animales.filter(animal => {
        return (
          animal.rp.toString().toLowerCase().includes(cond)
        )
      });
      guardarAnimalesFilter(filtro);
      guardarRP(rp);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      guardarAnimalesFilter(animales);
      guardarRP(rp);
    }

  };

  function obtenerAnim() {
    setLoading(true);
    //Filtro los animales con el estado requerido
    const anProd = movies.filter(animal => {
      return (
        animal && animal.fbaja == ''
      )
    });
    //calculo dias de servicio y lactancia
    const an = anProd.map(a => {
      let dl = 0;
      if (a.estpro == "En Ordeñe") {

        try {
          dl = differenceInDays(Date.now(), new Date(a.fparto));
          if (isNaN(dl)) dl = 0;
        } catch (error) {
          dl = 0;
        }

      }
      return {
        id: a.id,
        diasLact: dl,
        ...a
      }
    })
    guardarAnimales(an);
    setLoading(false);
  };



  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Buscar por RP"
        onChangeText={updateSearch}
        value={rp}
        lightTheme
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
      />
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
          renderItem={({ item }) => (
            <ListItem
              data={item}
              registrarBaja={() => {
                navigation.push('RegistrarBaja', {
                  animal: item,
                  usuario: usuario,
                  tambo: tambo,
                });
              }}
            />
          )}
          ItemSeparatorComponent={() => <Separator />}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
              onPress={() => setAlerta({ ...alerta, show: false })}
              buttonStyle={{ backgroundColor: alerta.color, marginTop: 10 }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const Separator = () => <View style={styles.separator}></View>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  searchBarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 5,
    borderWidth: 0,
  },
  searchBarInput: {
    backgroundColor: '#f1f3f6',

  },
  loadingIndicator: {
    marginTop: 20,
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#868584',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
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
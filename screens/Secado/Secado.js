import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar } from 'react-native-elements';
import differenceInDays from 'date-fns/differenceInDays';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeAlert from 'react-native-awesome-alerts';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default function AnimalListScreen({ navigation }) {
  const [movies, setMovies] = useContext(MovieContext);
  const route = useRoute();
  const { tambo, usuario } = route.params;

  const [animales, guardarAnimales] = useState([]);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rp, guardarRP] = useState('');
  const hoy = new Date();
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false,
  });

  useEffect(() => {
    // Busca los animales en ordeñe
    obtenerAnim();
  }, []);

  useEffect(() => {
    guardarAnimalesFilter(animales);
  }, [animales]);

  function updateSearch(rp) {
    const cond = rp.toLowerCase();
    const filtro = rp
      ? animales.filter(animal => animal.rp.toString().toLowerCase().includes(cond))
      : animales;

    guardarAnimalesFilter(filtro);
    guardarRP(rp);
  };

  async function obtenerAnim() {
    setLoading(true);
    // Filtra los animales con el estado requerido
    const anProd = movies.filter(animal => animal && animal.estpro !== "seca");

    // Calcula días de servicio y lactancia
    const an = anProd.map(a => {
      let d = 0;
      if (a.estrep !== "vacia") {
        try {
          d = differenceInDays(Date.now(), new Date(a.fservicio));
        } catch (error) {
          d = 0;
        }
      }
      return { id: a.id, diasPre: d, secar: false, ...a };
    });

    an.sort((a, b) => b.diasPre - a.diasPre);
    guardarAnimales(an);
    setLoading(false);
  };

  async function secarAnimales() {
    let e = false;
    let haySecado = false;

    for (const a of animales) {
      if (a.secar) {
        haySecado = true;
        try {
          const an = { estpro: 'seca' };
          let objIndex = movies.findIndex(obj => obj.id === a.id);
          const copia = [...movies];
          copia[objIndex].estpro = "seca";
          setMovies(copia);
          await firebase.db.collection('animal').doc(a.id).update(an);

          await firebase.db.collection('animal').doc(a.id).collection('eventos').add({
            fecha: hoy,
            tipo: 'Secado',
            detalle: 'Secado',
            usuario: usuario,
          });
        } catch (error) {
          e = true;
          setAlerta({
            show: true,
            titulo: '¡ERROR!',
            mensaje: `NO SE PUEDE SECAR EL RP: ${a.rp}`,
            color: '#DD6B55',
          });
        }
      }
    }

    if (!e && haySecado) {
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'ANIMALES SECADOS CON ÉXITO',
        color: '#3AD577',
        vuelve: true,
      });
    } else {
      navigation.popToTop();
    }
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
      {loading || animalesFilter.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color='#1b829b' />
        </View>
      ) : (
        <>
          {animalesFilter.length === 0 && !animales.length ? (
            <Text style={styles.alerta}>NO SE ENCONTRARON ANIMALES</Text>
          ) : (
            <>
              <FlatList
                data={animalesFilter}
                keyExtractor={item => item.id}
                initialNumToRender={100}
                renderItem={({ item }) => (
                  <ListItem
                    data={item}
                    animales={animales}
                    guardarAnimales={guardarAnimales}
                  />
                )}
                ItemSeparatorComponent={Separator}
                contentContainerStyle={styles.listContainer}
              />
              <Button
                title="ACEPTAR"
                icon={
                  <Icon
                    name="check-square"
                    size={24}
                    color="white"
                    containerStyle={styles.buttonIcon}
                  />
                }
                buttonStyle={styles.button}
                onPress={secarAnimales}
              />
            </>
          )}
        </>
      )}
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
        onConfirmPressed={() => {
          setAlerta({ show: false });
          if (alerta.vuelve) {
            navigation.popToTop();
          }
        }}
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
    backgroundColor: '#fce4ec',
    fontSize: 16,
    color: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginVertical: 10,
  },
  listContainer: {
    paddingBottom: 60, // Adding padding for the button
  },
  button: {
    backgroundColor: '#1b829b',
    borderRadius: 8,
    marginTop: 15,
  },
  buttonIcon: {
    marginRight: 10,
  },
  separator: {
    height: 5,
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

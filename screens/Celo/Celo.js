import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar } from 'react-native-elements';
import differenceInDays from 'date-fns/differenceInDays';
import { MovieContext } from "../Contexto";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const { movies, setMovies } = useContext(MovieContext);
  const [animales, guardarAnimales] = useState([]);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rp, guardarRP] = useState('');

  const route = useRoute();
  const { usuario } = route.params;

  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false,
  });

  useEffect(() => {
    obtenerAnim();
  }, []);

  useEffect(() => {
    guardarAnimalesFilter(animales);
  }, [animales]);

  const updateSearch = (rp) => {
    const cond = rp.toLowerCase();
    const filtro = rp
      ? animales.filter(animal => animal.rp.toString().toLowerCase().includes(cond))
      : animales;

    guardarAnimalesFilter(filtro);
    guardarRP(rp);
  };

  const hoy = new Date();

  const obtenerAnim = () => {
    setLoading(true);
    const anProd = movies.filter(animal => animal && animal.estpro !== "");
    const an = anProd.map(a => {
      let d = 0;
      if (a.estrep !== "vacia") {
        try {
          d = differenceInDays(Date.now(), new Date(a.fservicio));
        } catch (error) {
          d = 0;
        }
      }
      return {
        id: a.id,
        diasPre: d,
        celar: false,
        ...a,
      };
    });
    guardarAnimales(an);
    setLoading(false);
  };

  const registrarCelo = () => {
    let e = false;
    let hayCelo = false;
    animales.forEach(a => {
      if (a.celar) {
        hayCelo = true;
        try {
          const an = { celo: true };
          const objIndex = movies.findIndex(obj => obj.id === a.id);
          const copia = [...movies];
          copia[objIndex].celo = true;
          setMovies(copia);
          firebase.db.collection('animal').doc(a.id).update(an);
          firebase.db.collection('animal').doc(a.id).collection('eventos').add({
            fecha: hoy,
            tipo: 'Celo',
            usuario: usuario,
          });
        } catch (error) {
          e = true;
          setAlerta({
            show: true,
            titulo: '¡ERROR!',
            mensaje: 'NO SE PUDO REGISTRAR EL CELO',
            color: '#DD6B55',
          });
        }
      }
    });

    if (!e && hayCelo) {
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'CELOS REGISTRADOS CON ÉXITO',
        color: '#3AD577',
        vuelve: true,
      });
    } else {
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'NO SE REGISTARON CELOS',
        color: '#3AD577',
        vuelve: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Buscar por RP"
        onChangeText={updateSearch}
        value={rp}
        lightTheme
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
        placeholderTextColor="#888"
      />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color='#1b829b' />
        </View>
      ) : animalesFilter.length === 0 && !animales.length ? (
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
                guardarAnimales={guardarAnimales}
                animales={animales}
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
            onPress={registrarCelo}
          />
        </>
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

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingVertical: 8,
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
    paddingBottom: 80, // Increased padding for the button
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


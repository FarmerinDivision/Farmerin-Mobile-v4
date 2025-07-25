import React, { useEffect, useState, useContext, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, Button } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar, CheckBox } from 'react-native-elements';
import differenceInDays from 'date-fns/differenceInDays';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const { movies } = useContext(MovieContext);
  const [animalesFilter, setAnimalesFilter] = useState([]);
  const [rp, setRP] = useState('');

  const route = useRoute();
  const { tambo, estado, usuario } = route.params;

  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {
    obtenerAnimales();
  }, []);

  useEffect(() => {
    if (!loading) {
      setAnimalesFilter(animales);
    }
  }, [animales, loading]);

  const updateSearch = useCallback((rp) => {
    const lowerCaseRP = rp ? rp.toLowerCase() : '';
    const filtro = lowerCaseRP
      ? animales.filter(animal => animal.rp.toString().toLowerCase().includes(lowerCaseRP))
      : animales;
      
    setAnimalesFilter(filtro);
    setRP(rp);
  }, [animales]);

  const buscarCelo = useCallback(() => {
    if (checked) {
      setAnimalesFilter(animales);
      setChecked(false);
    } else {
      const filtro = animales.filter(animal => animal.celo);
      setAnimalesFilter(filtro);
      setChecked(true);
    }
  }, [checked, animales]);

  const obtenerAnimales = useCallback(() => {
    setLoading(true);
    const anProd = movies.filter(animal => animal && animal.estrep === "vacia");
    const an = anProd.map(a => {
      let diasServicio = 0, diasLact = 0;

      if (a.estrep === "vacia") {
        diasServicio = getDifferenceInDays(a.fservicio);
      }

      if (a.estpro === "En Ordeñe") {
        diasLact = getDifferenceInDays(a.fparto);
      }

      return {
        id: a.id,
        diasServicio,
        diasLact,
        ...a
      };
    });

    setAnimales(an);
    setLoading(false);
  }, [movies]);

  const getDifferenceInDays = (fecha) => {
    try {
      const dias = differenceInDays(Date.now(), new Date(fecha));
      return isNaN(dias) ? 0 : dias;
    } catch {
      return 0;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.barra}>
        <View style={styles.colbarra}>
          <SearchBar
            placeholder="Buscar por RP"
            onChangeText={updateSearch}
            value={rp}
            lightTheme
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
          />
        </View>
        <View style={styles.colbarra2}>
          <CheckBox
            title='CELOS'
            onPress={buscarCelo}
            checked={checked}
            containerStyle={styles.check}
            textStyle={styles.checkText}
          />
        </View>
      </View>
      <View style={styles.listado}>
        {loading || animalesFilter.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color='#1b829b' />
          </View>
        ) : (animalesFilter.length === 0 && !animales.length) ? (
          <Text style={styles.alerta}>NO SE ENCONTRARON ANIMALES</Text>
        ) : (
          <FlatList
            data={animalesFilter}
            keyExtractor={item => item.id}
            initialNumToRender={100}
            renderItem={({ item }) => (
              <ListItem
                data={item}
                registrarServicio={() => {
                  try {
                    navigation.push('RegistrarServicio', {
                      animal: item,
                      tambo: tambo,
                      usuario: usuario
                    });
                  } catch (error) {
                    Alert.alert('Error al registrar el servicio. Intenta nuevamente.');
                  }
                }}
              />
            )}
            ItemSeparatorComponent={Separator}
          />
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
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingTop: 5,
  },
  colbarra: {
    flex: 2,
    marginRight: 15,
  },
  colbarra2: {
    flex: 1,
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
  check: {
    backgroundColor: '#ffffff',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    elevation: 3,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  checkText: {
    fontSize: 16,
    color: '#1b829b',
    fontWeight: '600',
  },
  listado: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 20,
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

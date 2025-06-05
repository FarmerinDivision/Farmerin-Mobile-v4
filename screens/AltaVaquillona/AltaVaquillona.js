import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar } from 'react-native-elements';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import AwesomeAlert from 'react-native-awesome-alerts';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const [movies, setMovies] = useContext(MovieContext)
  const [animales, guardarAnimales] = useState([]);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const {usuario} = route.params;

  const [rp, guardarRP] = useState('');
  const hoy = new Date(); 
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve:false
  });


  useEffect(() => {
    obtenerAnim()
  }, [])
  useEffect(() => {
    guardarAnimalesFilter(animales)
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
    const anProd = movies.filter(animal => 
        animal.estpro === "cria" && animal.estpro != "seca"
    );
    const an = anProd.map(a => {
      return {
        id: a.id,
        ...a
      }

    })
    guardarAnimales(an);
    setLoading(false);
  };

/*
  function snapshotAnimal(snapshot) {
    const an = snapshot.docs.map(doc => {

      return {
        id: doc.id,
        cambiar: false,
        ...doc.data()
      }

    })


    guardarAnimales(an);
    setLoading(false);
  };
*/
  function cambiarAnimales() {
    let e = false;
    let hayCambio = false;
    animales.forEach(a => {
      if (a.cambiar) {
        hayCambio = true;
        try {
          const an = {
            estpro: 'seca'
          };
          let objIndex = movies.findIndex((obj => obj.id == a.id));
          const copia = [...movies]
          copia[objIndex].estpro='seca'
          setMovies(copia)
          firebase.db.collection('animal').doc(a.id).update(an);
          firebase.db.collection('animal').doc(a.id).collection('eventos').add({
            fecha: hoy,
            tipo: 'Alta Vaquillona',
            detalle: 'Cambio del registro de cría a seca',
            usuario: usuario
          })
        } catch (error) {
          e = true;
          setAlerta({
            show: true,
            titulo: '¡ERROR!',
            mensaje: 'AL PASAR EL ANIMAL A SECA',
            color: '#DD6B55'
          });

        }

      }
    })
    if (!e && hayCambio) {
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'ALTA REALIZADA CON ÉXITO ',
        color: '#3AD577',
        vuelve: true
      });

    }else{
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'NO SE REGISTRARON ALTAS',
        color: '#3AD577',
        vuelve:true
      });
      
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

    <View style={styles.listado}>
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
                  animales={animales}
                  guardarAnimales={guardarAnimales}
                />
              )
              }
              ItemSeparatorComponent={() => <Separator />}
            />

           <Button
           title="  ACEPTAR"
           icon={
             <Icon
               name="check-square"
               size={35}
               color="white"
             />
           }
           onPress={cambiarAnimales}
            />

        </>
      )}
    </View>

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
      onConfirmPressed={() => {
        setAlerta({ show: false });
        if (alerta.vuelve) {
          navigation.popToTop();
        }
      }}
    />
  </View>
);}

const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#2980B9' }}></View>

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
  separator: {
    height: 10,
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#868584',
    paddingHorizontal: 10,
    paddingVertical: 15,

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
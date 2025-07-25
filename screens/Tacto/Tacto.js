import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { SearchBar } from 'react-native-elements';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import differenceInDays from 'date-fns/differenceInDays';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';


export default ({ navigation }) => {
  const { movies, setMovies } = useContext(MovieContext)
  const [animales, guardarAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [botonConf, guardarBotonConf] = useState(true);
  const [rp, guardarRP] = useState('');
  const hoy = new Date();
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve:false
  });

  const route = useRoute()
  const {tambo} = route.params;
  const {estado} = route.params;
  const {usuario} = route.params;

  useEffect(() => {

    //busca los animales en ordeñe
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
/*
  function obtenerAnim() {
    setLoading(true);
    try {
      firebase.db.collection('animal').where('idtambo', '==', tambo.id).where('estpro', 'in', estado).where('estrep', '==', 'vacia').where('fbaja', '==', '').orderBy('rp').get().then(snapshotAnimal)
    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ERROR!',
        mensaje: 'No se pueden obtener los animales',
        color: '#DD6B55'
      });
    }
    
  }

*/


  function confirmarAnimales() {
    guardarBotonConf(false);
    let e = false;
    let hayPre = false;
    animales.forEach(a => {
      
      if (a.pre && a.nservicio > 0 ) {
        hayPre = true;
        //console.log(a.rp);  
        try {
          const an = {
            estrep: 'preñada'
          };
          let objIndex = movies.findIndex((obj => obj.id == a.id));
          const copia = [...movies]
          copia[objIndex].estrep="preñada"
          setMovies(copia)
          firebase.db.collection('animal').doc(a.id).update(an);
          firebase.db.collection('animal').doc(a.id).collection('eventos').add({
            fecha: hoy,
            tipo: 'Tacto',
            detalle: 'Confirmacion Preñez',
            usuario: usuario
          })
        } catch (error) {
          e = true;
          setAlerta({
            show: true,
            titulo: '¡ERROR!',
            mensaje: 'NO SE PUEDE REGISTRAR LA PREÑEZ',
            color: '#DD6B55'
          });

        }

      }
    })
    if (!e && hayPre) {
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'CONFIRMACIÓN DE PREÑEZ REALIZADAS CON ÉXITO',
        color: '#3AD577',
        vuelve:true
      });

    }else{
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'NO SE REGISTRARON CONFIRMACIÓNES DE PREÑEZ',
        color: '#3AD577',
        vuelve:true
      });
      
    }
   
  }
  function obtenerAnim() {
    setLoading(true);
    //Filtro los animales con el estado requerido
    const anProd = movies.filter(animal => {
      return (
        animal && (estado.indexOf(animal.estpro) > -1)
      )
    });
    //calculo dias de servicio y lactancia
    const an = anProd.map(a => {

      let d = 0;
      let dl = 0;
      if (a.estrep == "vacia") {

        try {
          d = differenceInDays(Date.now(), new Date(a.fservicio));
          if (isNaN(d)) d = 0;
        } catch (error) {
          d = 0;
        }

      }
      if (a.estpro == "En Ordeñe") {

        try {
          dl = differenceInDays(Date.now(), new Date(a.fparto));
          if (isNaN(dl)) dl = 0;
        } catch (error) {
          d = 0;
        }

      }
      return {
        id: a.id,
        diasServicio: d,
        pre: false,
        nservicio: a.nservicio,
        ...a
      }

    })
    function compare( a, b ) {
      if ( a.diasServicio <  b.diasServicio ){
        return 1;
      }
      if (  a.diasServicio >  b.diasServicio ){
        return -1;
      }
      return 0;
    }
    
    an.sort( compare );
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
              keyExtractor={(item) => item.id}
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
            {botonConf && (
              <Button
                title="ACEPTAR"
                icon={
                  <Icon
                    name="check-square"
                    size={25}
                    color="white"
                    style={styles.buttonIcon}
                  />
                }
                onPress={confirmarAnimales}
                buttonStyle={styles.button}
              />
            )}
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
  listado: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 20,
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
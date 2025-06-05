import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableHighlight } from 'react-native';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { encode } from 'base-64';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {

  const route = useRoute();
  const {tambo} = route.params;
  
  const [show, setShow] = useState(false);

  const [animales, guardarAnimales] = useState([]);
  const [ingresos, guardarIngresos] = useState([]);
  const [error, setError] = useState(null);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const {host}=tambo;

  useEffect(() => {
    
    if (!global.btoa) {
      global.btoa = encode;
    }
    //busca los animales en ordeñe
    obtenerAnim();
   
   
  }, []);

  async function obtenerIngresos() {
    guardarIngresos([]);
    //Formatea fecha 
    const tipof = typeof fecha;
    let fstring;
    let fdate;
    if (tipof == 'string') {
      let parts = fecha.split('/');
      fstring = (parts[2]) + '-' + (parts[1]) + '-' + parts[0];

    } else {
      fstring = format(fecha, 'yyyy-MM-dd');

    }

    const url = 'http://'+host+'/ingresos/' + fstring;
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {
      setLoading(true);
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      let ingjson = await api.json();
      //let ingjson = await Promise.all(promises);
      guardarIngresos(ingjson);

    } catch (error) {
      setError('ERROR AL CONECTARSE AL TAMBO');
    }
    setLoading(false);
  }


  async function comparar() {

    guardarAnimalesFilter([]);
    setLoading(true);

    await obtenerIngresos();
   // let finpromesas = await Promise.all(promises);

    if (ingresos.length > 0) {
      //transforma los ingresos en un vector con los erp
      const ing = ingresos.map(i => {
        return i.erp.toString();
      })
   
      //transforma los animales en un vector con los erp
      const anim = animales.map(a => {
        
        return a.erp.toString();
      })
  
      try {
        //busca los animales que no están en ingresos
        const filtro = animales.filter(a => {
          return (
            (ing.indexOf(a.erp.toString()) === -1)
          )
        });

        //busca los animales que no están en ingresos
        const filtro2 = ingresos.filter(i => {
          return (
            (anim.indexOf(i.erp.toString()) === -1)
          )
        });

        filtro2.map(o => {
          filtro.push(o);

        })

        guardarAnimalesFilter(filtro);

      } catch (error) {
        setError('ERROR AL COMPARAR INGRESOS');
      }
    }
    setLoading(false);

  };

  async function obtenerAnim() {
    setLoading(true);
    try {
      firebase.db.collection('animal').where('idtambo', '==', tambo.id).where('estpro', '==', 'En Ordeñe').where('fbaja', '==', '').orderBy('rp').get().then(snapshotAnimal)
    } catch (error) {
      setError('ERROR AL RECUPERAR LOS ANIMALES');
      setLoading(false);
    }
  }

  function snapshotAnimal(snapshot) {
    const an = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      }

    })
    guardarAnimales(an);
    guardarAnimales(an);
   
    setLoading(false);
  };

  function cambiarFecha(event, date) {
    const currentDate = date;
    setShow(false); 
    setFecha(currentDate);
  };
const handlever = ()=> {
  setShow(true);
}
let texto = format(fecha, 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <View style={styles.barra}>
        <View style={styles.colbarra}>
        <TouchableHighlight style={styles.calendario} onPress={handlever}>
          <View 
          
          ><Text style={styles.textocalendar}>{texto}</Text></View></TouchableHighlight>
        {show && (
          <DateTimePicker
            dateFormat="DD/MM/YYYY"
            maximumDate={new Date()}
            showIcon={true}
            androidMode="spinner"
            value={fecha}
            onChange={cambiarFecha}
          /> )}
        </View>

        <View style={styles.colbarra2}>
          <View style={styles.buscar}>
            <Button

              title="  BUSCAR"
              icon={
                <Icon
                  name="search"
                  size={25}
                  color="white"
                />
              }
              onPress={comparar}
            />
          </View>
        </View>

      </View>
      <View style={styles.lista}>
        {loading ?
          <ActivityIndicator size="large" color='#1b829b' />
          :
          error ?
            <Text style={styles.alerta}>{error}</Text>
            :
            ingresos.length == 0 ?
              <Text style={styles.alerta}>NO HAY INGRESOS REGISTRADOS</Text>
              :
              <>
                <FlatList
                  data={animalesFilter}
                  keyExtractor={item => item.id}
                  initialNumToRender={100}
                  renderItem={({ item }) => (
                    <ListItem
                      data={item}

                    />
                  )
                  }
                  ItemSeparatorComponent={() => <Separator />}
                />
              </>
        }
      </View>
    </View>
  );
}

const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#2980B9' }}></View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e8ee',
    flexDirection: 'column'
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#868584',
    paddingHorizontal: 10,
    paddingVertical: 15,

  },

  lista: {
    flex: 8,

  },
  textocalendar:{
    textAlign: "center"
  },
  calendario: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 5,
    width: 200,
   marginVertical: 10,
    marginLeft: 10
  },
  barra: {
    flex: 1,
    flexDirection: 'row',

  },
  colbarra: {
    flex: 3,

  },
  colbarra2: {
    flex: 2,

  },
  fecha: {
    padding: 5,
    width: 200
  },
  buscar: {
    padding: 5,

  },
});
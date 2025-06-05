import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Modal, TouchableHighlight  } from 'react-native';
import { Button } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListItem from './ListItem';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {

  const [fecha, setFecha] = useState(new Date());

  const route = useRoute();
  const {tambo} = route.params;

  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [controles, setControles] = useState('');
  const [nuevo, mostrarNuevo] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {
    //busca los controles lecheros realizados con la app
    obtenerControles();
    if (!usuario || usuario == '') {
      buscarUsuario();
      
    }
  }, []);

  async function buscarUsuario() {

    try {
      AsyncStorage.getItem('nombre').then((keyValue) => {
        setUsuario(keyValue);
        
      });
    } catch (error) {

      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: 'No se puede obtener el usuario',
        color: '#DD6B55'
      });
      setShowTambos(false);
    }
  }

  const validate = values => {
    const errors = {}

    if (!values.fecha) {
      errors.fecha = "INGRESE FECHA"
    }
    return errors
  }

  //La funcion validate debe estar declarada antes del form sino no funciona
  const formControl = useFormik({
    initialValues: {
      fecha: new Date()
    },
    validate,
    onSubmit: datos => guardar(datos)
  });

  function obtenerControles() {
    setLoading(true);
    try {
      firebase.db.collection('tambo').doc(tambo.id).collection('control').orderBy('fecha', 'desc').limit(30).get().then(snapshotControl)
    } catch (error) {
      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: 'No se pueden obtener los controles',
        color: '#DD6B55'
      });
    }
  }


  function snapshotControl(snapshot) {
    const c = snapshot.docs.map(doc => {

      return {
        id: doc.id,
        ...doc.data()
      }

    })
    setControles(c);
    setLoading(false);
  };


  async function guardar(datos) {

    //Formatea fecha 
    const tipof = typeof datos.fecha;
    let fstring;
    let fdate;

    if (tipof == 'string') {
      let parts = datos.fecha.split('/');
      fstring = (parts[2]) + '-' + (parts[1]) + '-' + parts[0];
      let fs = fstring + 'T04:00:00';
      fdate = new Date(fs);
    } else {
      fstring = format(datos.fecha, 'yyyy-MM-dd');
      fdate = datos.fecha;

    }

    //VALIDA QUE NO EXISTA UN CONTROL CON LA MISMA FECHA
    let fstring1, fstring2;
    fstring1 = format(fdate, 'yyyy-MM-dd');

    const cont = controles.filter(c => {
      let f = new Date(c.fecha.toDate());
      fstring2 = format(f, 'yyyy-MM-dd');

      return (
        fstring1 == fstring2 && c
      )
    });

    if (cont.length > 0) {
      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: 'Ya existe un control registrado en esta fecha',
        color: '#DD6B55'
      });

    } else {

      try {
        firebase.db.collection('tambo').doc(tambo.id).collection('control').add({
          fecha: fecha,
          estado: false
        });
        setAlerta({
          show: true,
          titulo: 'Atención!',
          mensaje: 'Control registrado con éxito',
          color: '#3AD577'
        });
        obtenerControles();
      } catch (error) {
        setAlerta({
          show: true,
          titulo: 'Error!',
          mensaje: 'No se pudo registrar el control',
          color: '#DD6B55'
        });
      }
    }

  }

  function aceptar() {
    mostrarNuevo(false);
    formControl.handleSubmit();
  }
  function cambiarFecha(event, date) {
    const currentDate = date;
    setShow(false); 
    setFecha(currentDate);
    formControl.handleChange('fecha')
  };
const handlever = ()=> {
  setShow(true);
}
let texto = format(fecha, 'yyyy-MM-dd');
  return (
    <View style={styles.container}>
      {loading ?
        <ActivityIndicator size="large" color='#1b829b' />
        :

        <>
          {controles.length == 0 && <Text style={styles.alerta}>NO SE ENCONTRARON REGISTROS</Text>}
          <FlatList
            data={controles}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ListItem
                data={item}
                listarControles={() => {
                  navigation.push('ControlLecheros', {
                    control: item, tambo: tambo,usuario:usuario
                  })
                }}
              />
            )
            }
            ItemSeparatorComponent={() => <Separator />}
          />

          <Button
            title="  NUEVO CONTROL"
            icon={
              <Icon
                name="plus-square"
                size={35}
                color="white"
              />
            }
            onPress={() => mostrarNuevo(true)}
          />
          <Text style={styles.text3}></Text>
        </>
      }
      <Modal
        animationType='fade'
        transparent={true}
        visible={nuevo}
      >
        <View style={styles.center}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.text2}>NUEVO CONTROL LECHERO</Text>
              
            </View>
            <TouchableHighlight style={styles.calendario} onPress={handlever}>
          <View 
          
          ><Text style={styles.textocalendar}>{texto}</Text></View></TouchableHighlight>
            {show && (
            <DateTimePicker
              placeholder="Fecha"
              dateFormat="DD/MM/YYYY"
              maximumDate={new Date()}
              showIcon={true}
              androidMode="spinner"
              style={styles.fecha}
              value={fecha}
              onChange={cambiarFecha}
              customStyles={{
                dateInput: {
                  borderColor: 'grey',
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: 'white'
                }
              }}
            /> )}
            {formControl.errors.fecha ? <Text style={styles.error}>{formControl.errors.fecha}</Text> : null}
            <Button
              title="  GUARDAR"
              icon={
                <Icon
                  name="check-square"
                  size={35}
                  color="white"
                />
              }
              onPress={aceptar}
            />
            <Text></Text>
            <Button
              onPress={() => mostrarNuevo(false)}
              type="outline"
              title=" CANCELAR"
              titleStyle={{ color: '#002E39' }}
              icon={
                <Icon
                  name="window-close"
                  size={30}
                  color="#2980B9"
                />
              }
            />
          </View>
        </View>

      </Modal>
      <AwesomeAlert
        show={alerta.show}
        showProgress={false}
        title={alerta.titulo}
        message={alerta.mensaje}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        cancelText="No, cancelar"
        confirmText="ACEPTAR"
        confirmButtonColor={alerta.color}
        onCancelPressed={() => {
          setAlerta({ show: false })
        }}
        onConfirmPressed={() => {
          setAlerta({ show: false })
        }}
      />
    </View>
  );
}

const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#2980B9' }}></View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e8ee',

  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#868584',
    paddingHorizontal: 10,
    paddingVertical: 15,

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
  center: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',

  },
  header: {

    backgroundColor: '#2980B9',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15

  },
  content: {
    backgroundColor: '#e1e8ee',
    borderWidth: 1,
    borderColor: 'white',
    margin: 20,
    marginTop: hp('25%'),
    borderRadius: 15,
    height: hp('40%'),

  },
  text2: {
    color: '#e1e8ee',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10

  },
  fecha: {
    width: wp('90%'),
    padding: 5,
    height: 50,
    marginTop: 10,
    marginBottom: 10
  },

  error: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: 13,
    borderRadius: 5,
    color: 'red',
    backgroundColor: 'pink',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'red'

  },
  text3: {
    fontSize: 5,
  },
});
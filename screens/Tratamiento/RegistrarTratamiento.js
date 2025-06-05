import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import InfoAnimal from '../InfoAnimal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format } from 'date-fns';
import AwesomeAlert from 'react-native-awesome-alerts';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';



export default ({ navigation }) => {
  const [show, setShow] = useState(false);
  const [fecha, setFecha] = useState(new Date());

  const routeTratam = useRoute();
  const {animal} = routeTratam.params;
  const {usuario} = routeTratam.params;
  const {tratam} = routeTratam.params;

  const [tratamientos, setTratamientos] = useState([{ value: '', label: '' }]);
  const [enfermedad, setEnfermedad] = useState([{ value: '', label: '' }]);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false
  });

  useEffect(() => {
    //busca los tratamientos
    obtenerTratamientos();

  }, []);

  function obtenerTratamientos() {
    tratam.map(doc => {
      let tr = {
        key: doc.descripcion,
        value: doc.descripcion,
        label: doc.descripcion
      }

      if (doc.tipo == 'tratamiento') {
        setTratamientos(tratamientos => [...tratamientos, tr]);
      } else if (doc.tipo == 'enfermedad'){
        setEnfermedad(enfermedad => [...enfermedad, tr]);
      }
    })
  }

  const validate = values => {
    const errors = {}
    if (values.tratamiento == '') {
      errors.tratamiento = "DEBE SELECCIONAR UN TRATAMIENTO"
    }
    if (values.enfermedad == '') {
      errors.enfermedad = "DEBE SELECCIONAR UNA ENFERMEDAD"
    }
    return errors
  }

  //La funcion validate debe estar declarada antes del form sino no funciona
  const formTratamiento = useFormik({
    initialValues: {
      fecha: fecha,
      enfermedad: '',
      tratamiento: '',
      obs: ''
    },
    validate,
    onSubmit: datos => guardar(datos)
  });




  function guardar(datos) {

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
      fstring = format(fecha, 'yyyy-MM-dd');
      fdate = datos.fecha;
      console.log('ESTO TIRO', fdate)

    }

    let detalle = 'Enfermedad: ' + datos.enfermedad + ' /Tratamiento: ' + datos.tratamiento + ' /Obs: ' + datos.obs;
    try {

      firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
        fecha: fecha,
        tipo: 'Tratamiento',
        detalle: detalle,
        usuario: usuario
      
      })
      setAlerta({
        show: true,
        titulo: '¡ATENCION!',
        mensaje: 'TRATAMIENTO REGISTRADO CON ÉXITO',
        color: '#3AD577',
        vuelve: true,
      });
      console.log('EXITO', detalle)

    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE REGISTRAR EL TRATAMIENTO',
        color: '#DD6B55'
      });
      console.log('ERROR', error)
    }



  }

  function cambiarFecha(event, date) {
    const currentDate = date;
    setShow(false); 
    setFecha(currentDate);
    formTratamiento.handleChange('fecha')
  };
const handlever = ()=> {
  setShow(true);
}
console.log('TRATAM', formTratamiento)
let texto = format(fecha, 'yyyy-MM-dd');

return (
  <View style={styles.container}>
    <InfoAnimal
      animal={animal}
    />

    <View style={styles.form}>
      <ScrollView>
        <Text style={styles.texto}>FECHA:</Text>
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
        <View>
          <Text style={styles.texto}>ENFERMEDAD:</Text>
     
          <RNPickerSelect
              items={enfermedad}
              onValueChange={formTratamiento.handleChange('enfermedad')}
              value={formTratamiento.values.enfermedad}

              placeholder={{
                label: 'SELECCIONAR ENFERMEDAD',
                value: null,
                color: '#9EA0A4',
              }}
              style={styles.pickerStyle}
            />

          {formTratamiento.errors.enfermedad ? <Text style={styles.error}>{formTratamiento.errors.enfermedad}</Text> : null}
        </View>
        <View>
          <Text style={styles.texto}>TRATAMIENTO:</Text>
      
          <RNPickerSelect
              items={tratamientos}
              onValueChange={formTratamiento.handleChange('tratamiento')}
              value={formTratamiento.values.tratamiento}

              placeholder={{
                label: 'SELECCIONAR TRATAMIENTO',
                value: null,
                color: '#9EA0A4',
              }}
              style={styles.pickerStyle}
            />

          {formTratamiento.errors.tratamiento ? <Text style={styles.error}>{formTratamiento.errors.tratamiento}</Text> : null}
        </View>
        <View>
          <Text style={styles.texto}>OBSERVACIONES:</Text>
          <TextInput
            style={styles.entrada}
            onChangeText={formTratamiento.handleChange('obs')}
            value={formTratamiento.values.obs}
          />

        </View>
      </ScrollView>
    </View>
    <Button
      title="  ACEPTAR"
      icon={
        <Icon
          name="check-square"
          size={35}
          color="white"
        />
      }
      onPress={formTratamiento.handleSubmit}
    />
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
        if (alerta.vuelve == true) {
          navigation.popToTop();
        }
      }}
    />
  </View >
);
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e8ee',
  },
  form: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 10,

  },
  fecha: {
    width: wp('100%'),
    padding: 5,
    height: 50
  },
  lista: {
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'grey',
    height: 50

  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,

  },
  textocalendar:{
    textAlign: "center"
  },
  calendario: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
    width: wp('90%'),
    alignSelf: 'center',
    marginVertical: 10,
  },
  header: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#399dad'
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

  entrada: {
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 10,
    height: 50,
  },
  boton: {
    margin: 5
  },

  pickerStyle: {
    inputIOS: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      height: 50,
      borderColor: '#d0d0d0',
      borderWidth: 1,
      paddingHorizontal: 15,
      color: '#333',
      fontSize: 16,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    inputAndroid: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      height: 50,
      borderColor: '#d0d0d0',
      borderWidth: 1,
      paddingHorizontal: 15,
      color: '#333',
      fontSize: 16,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    placeholder: {
      color: '#9EA0A4',
    },
    iconContainer: {
      top: 10,
      right: 10,
    },
  },


});
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import InfoAnimal from '../InfoAnimal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format } from 'date-fns';
import AwesomeAlert from 'react-native-awesome-alerts';
import ModalSelector from 'react-native-modal-selector';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const [fecha, setFecha] = useState(new Date());
  const [movies, setMovies, trata] = useContext(MovieContext);
  const route = useRoute();
  const { animal, tambo, usuario } = route.params;

  const [show, setShow] = useState(false);
  const [tratamientoOptions, setTratamientoOptios] = useState([{ value: '-', label: '' }]);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false
  });

  useEffect(() => {
    obtenerTratamientos();
  }, []);

  const validate = values => {
    const errors = {};
    return errors;
  };

  const formCelo = useFormik({
    initialValues: {
      fecha: new Date(),
      tratamiento: '',
    },
    validate,
    onSubmit: datos => guardar(datos)
  });

  function obtenerTratamientos() {
    const filtrado = trata.filter(e => e.tipo === "tratamiento");
    filtrado.forEach(doc => {
      const tr = {
        value: doc.descripcion,
        label: doc.descripcion
      };
      setTratamientoOptios(prevOptions => [...prevOptions, tr]);
    });
  }

  function guardar(datos) {
    let fdate;

    if (typeof datos.fecha === 'string') {
      const parts = datos.fecha.split('/');
      const fstring = `${parts[2]}-${parts[1]}-${parts[0]}T04:00:00`;
      fdate = new Date(fstring);
    } else {
      fdate = datos.fecha;
    }

    const an = { celo: true };

    try {
      const objIndex = movies.findIndex(obj => obj.id === animal.id);
      const copia = [...movies];
      const obj = copia[objIndex];
      const nuevo = { ...obj, ...an };
      copia[objIndex] = nuevo;
      setMovies(copia);
      firebase.db.collection('animal').doc(animal.id).update(an);
      firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
        fecha: fdate,
        tipo: 'Celo',
        detalle: datos.tratamiento,
        usuario: usuario
      });
      setAlerta({
        show: true,
        titulo: '¡ATENCIÓN!',
        mensaje: 'CELO REGISTRADO CON ÉXITO',
        color: '#3AD577',
        vuelve: true
      });

    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ERROR!',
        mensaje: 'NO SE PUDO REGISTRAR EL CELO',
        color: '#DD6B55'
      });
    }
  }

  function cambiarFecha(event, date) {
    setShow(false);
    setFecha(date);
    formCelo.handleChange('fecha');
  }

  const handlever = () => {
    setShow(true);
  };

  const texto = format(fecha, 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <InfoAnimal animal={animal} />
      <View style={styles.form}>
        <Text style={styles.texto}>FECHA:</Text>
        <TouchableHighlight style={styles.calendario} onPress={handlever}>
          <View>
            <Text style={styles.textocalendar}>{texto}</Text>
          </View>
        </TouchableHighlight>
        {show && (
          <DateTimePicker
            dateFormat="DD/MM/YYYY"
            maximumDate={new Date()}
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
          />
        )}
        <View>
          <Text style={styles.texto}>TRATAMIENTO:</Text>
          <ModalSelector
            data={tratamientoOptions}
            onValueChange={formCelo.handleChange('tratamiento')}
            value={formCelo.values.tratamiento}
            initValue="SELECCIONA UN MOTIVO"
            style={styles.modalSelector}
          />
        </View>
      </View>
      <Button
        buttonStyle={styles.boton}
        title="ACEPTAR"
        icon={<Icon name="check-square" size={25} color="white" />}
        onPress={formCelo.handleSubmit}
      />
      <AwesomeAlert
        show={alerta.show}
        showProgress={false}
        title={alerta.titulo}
        message={alerta.mensaje}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f2f4f8'
  },
  form: {
    flex: 1,
    backgroundColor: '#e1e8ee',
    padding: 10,
    borderRadius: 8,
  },
  fecha: {
    width: wp('100%'),
    padding: 5,
    height: 50
  },
  texto: {
    marginLeft: 5,
    marginTop: 10,
    fontSize: 16,
    color: '#444'
  },
  textocalendar: {
    textAlign: "center",
    fontSize: 16,
    color: '#1b829b'
  },
  calendario: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 10,
    width: wp('90%'),
    marginVertical: 10,
    alignSelf: 'center'
  },
  boton: {
    backgroundColor: '#1b829b',
    borderRadius: 8,
    marginVertical: 10,
    padding: 10
  },
  modalSelector: {
    backgroundColor: '#FDFFFF',
    borderRadius: 8,
    marginVertical: 10
  }
});

import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import InfoAnimal from '../InfoAnimal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import DropDownPicker from 'react-native-dropdown-picker';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default function RegistroAborto({ navigation }) {
  const [fecha, setFecha] = useState(new Date());
  const { movies, setMovies, trata } = useContext(MovieContext);
  const route = useRoute();
  const { animal, usuario } = route.params;

  const [show, setShow] = useState(false);
  const [tratamientoOptions, setTratamientoOptions] = useState([]);
  const [options, setOptions] = useState([
    { value: 'Aborto', label: 'ABORTO' },
    { value: 'Aborto inicia lactancia', label: 'ABORTO INICIA LACTANCIA' },
  ]);
  
  // Estados para DropDownPicker
  const [openTipo, setOpenTipo] = useState(false);
  const [openTratamiento, setOpenTratamiento] = useState(false);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false,
  });

  const guardar = async (datos) => {
    try {
      const fdate = formatFecha(datos.fecha);
      const an = actualizarAnimal(datos, fdate);
      const objIndex = movies.findIndex(obj => obj.id === animal.id);
      const copia = [...movies];
      copia[objIndex] = { ...copia[objIndex], ...an };
      setMovies(copia);

      await firebase.db.collection('animal').doc(animal.id).update(an);
      await firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
        fecha: fecha,
        tipo: datos.tipo,
        detalle: datos.tratamiento,
        usuario: usuario,
      });

      mostrarAlerta('¡ATENCION!', 'ABORTO REGISTRADO CON ÉXITO', '#3AD577', true);
    } catch (error) {
      mostrarAlerta('¡ ERROR !', 'NO SE PUDO REGISTRAR EL ABORTO', '#DD6B55');
    }
  };

  const formAborto = useFormik({
    initialValues: {
      fecha: new Date(),
      tipo: 'Aborto inicia lactancia',
      tratamiento: '-',
    },
    onSubmit: async (values) => {
      try {
        const fdate = formatFecha(values.fecha);
        const an = actualizarAnimal(values, fdate);
        const objIndex = movies.findIndex(obj => obj.id === animal.id);
        const copia = [...movies];
        copia[objIndex] = { ...copia[objIndex], ...an };
        setMovies(copia);

        await firebase.db.collection('animal').doc(animal.id).update(an);
        await firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
          fecha: fecha,
          tipo: values.tipo,
          detalle: values.tratamiento,
          usuario: usuario,
        });

        mostrarAlerta('¡ATENCION!', 'ABORTO REGISTRADO CON ÉXITO', '#3AD577', true);
      } catch (error) {
        mostrarAlerta('¡ ERROR !', 'NO SE PUDO REGISTRAR EL ABORTO', '#DD6B55');
      }
    },
  });

  useEffect(() => {
    if (animal.diasPre < 150) {
      formAborto.setFieldValue('tipo', 'Aborto');
      setOptions([{ value: 'Aborto', label: 'ABORTO' }]);
    }
    obtenerTratamientos();
  }, []);

  const obtenerTratamientos = () => {
    const filtrado = trata.filter(e => e.tipo === "tratamiento");
    const nuevosTratamientos = [
      { value: '-', label: 'Sin tratamiento' },
      ...filtrado.map(doc => ({
        value: doc.descripcion,
        label: doc.descripcion,
      }))
    ];
    setTratamientoOptions(nuevosTratamientos);
  };

  const formatFecha = (fecha) => {
    if (typeof fecha === 'string') {
      const parts = fecha.split('/');
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T04:00:00`);
    }
    return fecha;
  };

  const actualizarAnimal = (datos, fdate) => {
    let lact = parseInt(animal.lactancia);
    let estado = animal.estpro;

    if (datos.tipo !== 'Aborto') {
      lact++;
      estado = 'En Ordeñe';
    }

    return {
      lactancia: lact,
      estpro: estado,
      estrep: 'vacia',
      fparto: format(fdate, 'yyyy-MM-dd'),
      fservicio: '',
      categoria: lact > 1 ? 'Vaca' : 'Vaquillona',
      nservicio: 0,
    };
  };

  const mostrarAlerta = (titulo, mensaje, color, vuelve = false) => {
    setAlerta({ show: true, titulo, mensaje, color, vuelve });
  };

  const cambiarFecha = (event, date) => {
    setShow(false);
    setFecha(date);
    formAborto.setFieldValue('fecha', date);
  };

  const handlever = () => setShow(true);
  const texto = format(fecha, 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <InfoAnimal animal={animal} />
      <View style={styles.form}>
        <Text style={styles.texto}>FECHA:</Text>
        <TouchableHighlight style={styles.calendario} onPress={handlever} underlayColor="#ddd">
          <Text style={styles.textocalendar}>{texto}</Text>
        </TouchableHighlight>
        {show && (
          <DateTimePicker
            dateFormat="DD/MM/YYYY"
            maximumDate={new Date()}
            androidMode="spinner"
            style={styles.fecha}
            value={fecha}
            onChange={cambiarFecha}
            customStyles={styles.datePicker}
          />
        )}
        <Text style={styles.texto}>TIPO:</Text>
        <View style={{ zIndex: 2000, marginBottom: 15 }}>
          <DropDownPicker
            open={openTipo}
            value={formAborto.values.tipo}
            items={options}
            setOpen={setOpenTipo}
            setItems={setOptions}
            setValue={callback => {
              const val = callback();
              formAborto.setFieldValue('tipo', val);
            }}
            placeholder="Seleccionar tipo"
            zIndex={2000}
            zIndexInverse={1000}
            style={{
              borderColor: '#d0d0d0',
              borderRadius: 12,
              backgroundColor: '#ffffff',
            }}
            dropDownContainerStyle={{
              borderColor: '#d0d0d0',
              backgroundColor: '#ffffff',
            }}
          />
        </View>
        <Text style={styles.texto}>TRATAMIENTO:</Text>
        <View style={{ zIndex: 1000, marginBottom: 15 }}>
          <DropDownPicker
            open={openTratamiento}
            value={formAborto.values.tratamiento}
            items={tratamientoOptions}
            setOpen={setOpenTratamiento}
            setItems={setTratamientoOptions}
            setValue={callback => {
              const val = callback();
              formAborto.setFieldValue('tratamiento', val);
            }}
            placeholder="Seleccionar tratamiento"
            zIndex={1000}
            zIndexInverse={2000}
            style={{
              borderColor: '#d0d0d0',
              borderRadius: 12,
              backgroundColor: '#ffffff',
            }}
            dropDownContainerStyle={{
              borderColor: '#d0d0d0',
              backgroundColor: '#ffffff',
            }}
          />
        </View>
      </View>
      <Button
        title="ACEPTAR"
        icon={<Icon name="check-square" size={35} color="#fff" />}
        buttonStyle={styles.button}
        onPress={formAborto.handleSubmit}
      />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  textocalendar: {
    textAlign: "center",
    fontSize: 16,
    color: '#333'
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
  form: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  fecha: {
    width: '100%',
    marginTop: 10,
  },
  texto: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  button: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    marginTop: 15,
    paddingVertical: 10,
  },
});

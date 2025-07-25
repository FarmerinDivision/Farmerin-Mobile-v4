// Código actualizado con react-native-dropdown-picker
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import InfoAnimal from '../InfoAnimal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import firebase from '../../database/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';
import DropDownPicker from 'react-native-dropdown-picker';

export default ({ navigation }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { movies, setMovies, trata: tratamientos, torosx: torosData } = useContext(MovieContext);
  const [isPregnant, setIsPregnant] = useState(false);
  const route = useRoute();
  const { animal, tambo, usuario } = route.params;

  const [tratamientoOptions, setTratamientoOptions] = useState([]);
  const [toros, setToros] = useState([]);
  const tipoOptions = [
    { label: 'CONVENCIONAL', value: 'Convencional' },
    { label: 'SEXADO', value: 'Sexado' },
  ];

  const [openTratamiento, setOpenTratamiento] = useState(false);
  const [openToro, setOpenToro] = useState(false);
  const [openTipo, setOpenTipo] = useState(false);

  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false,
  });

  useEffect(() => {
    fetchTratamientos();
    fetchToros();
  }, []);

  const validate = values => {
    const errors = {};
    // Puedes agregar validaciones aquí si es necesario
    return errors;
  };

  const formik = useFormik({
    initialValues: {
      fecha: new Date(),
      tratamiento: '',
      toro: 'Robo',
      tipo: 'Convencional',
      obs: ''
    },
    validate,
    onSubmit: values => handleSave(values)
  });

  const fetchTratamientos = () => {
    const filteredTratamientos = tratamientos.filter(e => e.tipo === "servicio");

    const newOptions = filteredTratamientos.map(doc => ({
      key: doc.id,
      value: doc.descripcion,
      label: doc.descripcion
    }));

    setTratamientoOptions(prev => [...prev, ...newOptions]);
  };

  const fetchToros = () => {
    try {
      firebase.db.collection('macho')
        .where('idtambo', '==', tambo.id)
        .where('cat', '==', 'toro')
        .get()
        .then(snapshot => {
          const newToros = snapshot.docs.map(doc => ({
            key: doc.id,
            value: doc.data().hba,
            label: doc.data().hba
          }));
          setToros(prev => [...prev, ...newToros]);
        });
    } catch (error) {
      showAlert('¡ ERROR !', 'NO SE PUEDEN OBTENER LOS TOROS');
    }
  };

  const handleSave = (datos) => {
    const formattedDate = formatDate(datos.fecha);

    const detalle = `Toro: ${datos.toro} / Tipo: ${datos.tipo} / Tratamiento: ${datos.tratamiento} / Obs: ${datos.obs}`;
    const serv = animal.nservicio;
    const estadoRepro = isPregnant ? "preñada" : "vacia";

    const animalUpdate = {
      fservicio: formattedDate,
      nservicio: serv + 1,
      celo: false,
      estrep: estadoRepro
    };

    try {
      const objIndex = movies.findIndex(obj => obj.id === animal.id);
      const updatedMovies = [...movies];
      updatedMovies[objIndex] = { ...updatedMovies[objIndex], ...animalUpdate };

      setMovies(updatedMovies);
      firebase.db.collection('animal').doc(animal.id).update(animalUpdate);
      firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
        fecha: selectedDate,
        tipo: 'Servicio',
        detalle: detalle,
        usuario: usuario
      });
      showAlert('¡ ATENCIÓN !', 'SERVICIO REGISTRADO CON ÉXITO', '#3AD577', true);

    } catch (error) {
      showAlert('¡ ERROR !', 'NO SE PUEDE REGISTRAR EL SERVICIO');
    }
  };

  const formatDate = (date) => {
    if (typeof date === 'string') {
      const parts = date.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}T04:00:00`;
    }
    return format(selectedDate, 'yyyy-MM-dd');
  };

  const showAlert = (title, message, color = '#DD6B55', goBack = false) => {
    setAlerta({
      show: true,
      titulo: title,
      mensaje: message,
      color: color,
      vuelve: goBack,
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      formik.setFieldValue('fecha', date);
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <InfoAnimal animal={animal} datos='servicio' />
      <View style={styles.formContainer}>
        <ScrollView>
          <Text style={styles.label}>FECHA:</Text>
          <TouchableOpacity style={styles.calendario} onPress={handleDatePress}>
            <Text style={styles.textoCalendar}>{format(selectedDate, 'yyyy-MM-dd')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              dateFormat="DD/MM/YYYY"
              maximumDate={new Date()}
              androidMode="spinner"
              style={styles.fecha}
              value={selectedDate}
              onChange={handleDateChange}
              customStyles={{
                dateInput: {
                  borderColor: '#1b829b',
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: '#ffffff'
                }
              }}
            />
          )}
          <Text style={styles.label}>TRATAMIENTO:</Text>
          <DropDownPicker
            open={openTratamiento}
            value={formik.values.tratamiento}
            items={tratamientoOptions}
            setOpen={setOpenTratamiento}
            setValue={cb => formik.setFieldValue('tratamiento', cb())}
            setItems={setTratamientoOptions}
            placeholder="SELECCIONAR TRATAMIENTO"
            zIndex={3000}
            style={{ marginBottom: 15 }}
          />
          <Text style={styles.label}>TORO:</Text>
          <DropDownPicker
            open={openToro}
            value={formik.values.toro}
            items={toros}
            setOpen={setOpenToro}
            setValue={cb => formik.setFieldValue('toro', cb())}
            setItems={setToros}
            placeholder="SELECCIONAR TORO"
            zIndex={2000}
            style={{ marginBottom: 15 }}
          />

          <Text style={styles.label}>TIPO SEMEN:</Text>
          <DropDownPicker
            open={openTipo}
            value={formik.values.tipo}
            items={tipoOptions}
            setOpen={setOpenTipo}
            setValue={cb => formik.setFieldValue('tipo', cb())}
            setItems={() => { }}
            placeholder="SELECCIONAR TIPO"
            zIndex={1000}
            style={{ marginBottom: 15 }}
          />

          <Text style={styles.label}>OBSERVACIONES:</Text>
          <TextInput
            style={styles.entrada}
            onChangeText={formik.handleChange('obs')}
            value={formik.values.obs}
            multiline
          />
        </ScrollView>
      </View>
      <Button
        title="  ACEPTAR"
        icon={<Icon name="check-square" size={35} color="white" />}
        buttonStyle={styles.button}
        onPress={formik.handleSubmit}
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
                if (alerta.vuelve) navigation.popToTop();
              }}
              buttonStyle={{ backgroundColor: alerta.color, marginTop: 10 }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const PickerField = ({ label, items, formik, fieldName }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <RNPickerSelect
      items={items}
      onValueChange={formik.handleChange(fieldName)}
      value={formik.values[fieldName]}
      placeholder={{
        label: `SELECCIONAR ${label}`,
        value: null,
        color: '#9EA0A4',
      }}
      style={styles.pickerSelectStyles}
    />
  </View>
);

const TextField = ({ label, formik, fieldName }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.entrada}
      onChangeText={formik.handleChange(fieldName)}
      value={formik.values[fieldName]}
      multiline
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e8ee',
  },
  formContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  calendario: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1b829b',
    marginBottom: 15,
  },
  textoCalendar: {
    fontSize: 16,
    color: '#444',
  },
  entrada: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 80,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1b829b',
    borderRadius: 8,
    marginTop: 15,
    paddingVertical: 15,
  },
  pickerSelectStyles: {
    inputIOS: {
      color: '#000',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginBottom: 15,
    },
    inputAndroid: {
      color: '#000',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginBottom: 15,
    },
  },
});


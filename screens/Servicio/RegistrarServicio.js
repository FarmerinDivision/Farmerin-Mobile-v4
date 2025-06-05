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
import AwesomeAlert from 'react-native-awesome-alerts';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';
import RNPickerSelect from 'react-native-picker-select';

export default ({ navigation }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movies, setMovies, tratamientos, torosData] = useContext(MovieContext);
  const [isPregnant, setIsPregnant] = useState(false);
  const route = useRoute();
  const { animal, tambo, usuario } = route.params;

  const [tratamientoOptions, setTratamientoOptions] = useState([{ value: '-', label: '' }]);
  const [toros, setToros] = useState([{ key: 1, value: 'Robo', label: 'ROBO' }]);
  const tipoOptions = [
    { key: 1, value: 'Convencional', label: 'CONVENCIONAL' },
    { key: 2, value: 'Sexado', label: 'SEXADO' }
  ];
  
  const [alertData, setAlertData] = useState({
    show: false,
    title: '',
    message: '',
    color: '#DD6B55',
    goBack: false,
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
    setAlertData({
      show: true,
      title,
      message,
      color,
      goBack,
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
          <PickerField label="TRATAMIENTO:" items={tratamientoOptions} formik={formik} fieldName="tratamiento" />
          <PickerField label="TORO:" items={toros} formik={formik} fieldName="toro" />
          <PickerField label="TIPO SEMEN:" items={tipoOptions} formik={formik} fieldName="tipo" />
          <TextField label="OBSERVACIONES:" formik={formik} fieldName="obs" />
        </ScrollView>
      </View>
      <Button
        title="  ACEPTAR"
        icon={<Icon name="check-square" size={35} color="white" />}
        buttonStyle={styles.button}
        onPress={formik.handleSubmit}
      />
      <AwesomeAlert
        show={alertData.show}
        title={alertData.title}
        message={alertData.message}
        closeOnTouchOutside={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmButtonColor={alertData.color}
        onConfirmPressed={() => {
          setAlertData({ show: false });
          if (alertData.goBack) {
            navigation.pop();
          }
        }}
      />
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


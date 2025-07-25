import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableHighlight, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import InfoAnimal from '../InfoAnimal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import firebase from '../../database/firebase';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import { MovieContext } from "../Contexto";
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const [show, setShow] = useState(false);
  const [fecha, setFecha] = useState(new Date());

  const routeTratam = useRoute();
  const { animal, usuario, tratam } = routeTratam.params;

  const [itemsTrat, setItemsTrat] = useState([]);
  const [itemsEnf, setItemsEnf] = useState([]);
  const [openTrat, setOpenTrat] = useState(false);
  const [openEnf, setOpenEnf] = useState(false);

  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false
  });

  useEffect(() => {
    const enf = [];
    const trat = [];
    tratam.map(doc => {
      let item = { label: doc.descripcion, value: doc.descripcion };
      if (doc.tipo === 'tratamiento') {
        trat.push(item);
      } else if (doc.tipo === 'enfermedad') {
        enf.push(item);
      }
    });
    setItemsTrat(trat);
    setItemsEnf(enf);
  }, []);

  const validate = values => {
    const errors = {};
    if (!values.tratamiento) {
      errors.tratamiento = "DEBE SELECCIONAR UN TRATAMIENTO";
    }
    if (!values.enfermedad) {
      errors.enfermedad = "DEBE SELECCIONAR UNA ENFERMEDAD";
    }
    return errors;
  };

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
    let fstring = format(fecha, 'yyyy-MM-dd');
    let fdate = fecha;
    let detalle = 'Enfermedad: ' + datos.enfermedad + ' /Tratamiento: ' + datos.tratamiento + ' /Obs: ' + datos.obs;
    try {
      firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
        fecha: fdate,
        tipo: 'Tratamiento',
        detalle: detalle,
        usuario: usuario
      });
      setAlerta({
        show: true,
        titulo: '¡ATENCION!',
        mensaje: 'TRATAMIENTO REGISTRADO CON ÉXITO',
        color: '#3AD577',
        vuelve: true
      });
    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE REGISTRAR EL TRATAMIENTO',
        color: '#DD6B55'
      });
    }
  }

  function cambiarFecha(event, date) {
    const currentDate = date;
    setShow(false);
    setFecha(currentDate);
    formTratamiento.setFieldValue('fecha', currentDate);
  }

  const handlever = () => setShow(true);

  let texto = format(fecha, 'yyyy-MM-dd');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <InfoAnimal animal={animal} />

        <View style={styles.form}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.texto}>FECHA:</Text>
            <TouchableHighlight style={styles.calendario} onPress={handlever}>
              <View><Text style={styles.textocalendar}>{texto}</Text></View>
            </TouchableHighlight>
            {show && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={cambiarFecha}
                style={styles.fecha}
              />
            )}

            <Text style={styles.texto}>ENFERMEDAD:</Text>
            <DropDownPicker
              open={openEnf}
              value={formTratamiento.values.enfermedad}
              items={itemsEnf}
              setOpen={setOpenEnf}
              setValue={(callback) => formTratamiento.setFieldValue('enfermedad', callback())}
              setItems={setItemsEnf}
              placeholder="SELECCIONAR ENFERMEDAD"
              zIndex={3000}
              style={{ marginBottom: 20 }}
            />
            {formTratamiento.errors.enfermedad ? <Text style={styles.error}>{formTratamiento.errors.enfermedad}</Text> : null}

            <Text style={styles.texto}>TRATAMIENTO:</Text>
            <DropDownPicker
              open={openTrat}
              value={formTratamiento.values.tratamiento}
              items={itemsTrat}
              setOpen={setOpenTrat}
              setValue={(callback) => formTratamiento.setFieldValue('tratamiento', callback())}
              setItems={setItemsTrat}
              placeholder="SELECCIONAR TRATAMIENTO"
              zIndex={2000}
              style={{ marginBottom: 20 }}
            />
            {formTratamiento.errors.tratamiento ? <Text style={styles.error}>{formTratamiento.errors.tratamiento}</Text> : null}

            <Text style={styles.texto}>OBSERVACIONES:</Text>
            <TextInput
              style={styles.entrada}
              onChangeText={formTratamiento.handleChange('obs')}
              value={formTratamiento.values.obs}
            />
          </ScrollView>
        </View>

        <Button
          title="  ACEPTAR"
          icon={<Icon name="check-square" size={35} color="white" />}
          onPress={formTratamiento.handleSubmit}
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
    </TouchableWithoutFeedback>
  );
};

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
  texto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  textocalendar: {
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
});

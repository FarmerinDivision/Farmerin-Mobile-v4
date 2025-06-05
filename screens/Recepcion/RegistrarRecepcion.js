import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Modal, Image, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
//import 'expo-firestore-offline-persistence';


import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '../../database/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format } from 'date-fns';
import { Camera } from 'expo-camera';
import AwesomeAlert from 'react-native-awesome-alerts';
import RNPickerSelect from 'react-native-picker-select';
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const [showfecha, setShowFecha] = useState(false);
  const [fecha, setFecha] = useState(new Date());

  const route = useRoute();
  const {tambo} = route.params;
  const {usuario} = route.params;

  const tipos = [
    { value: 'Racion', label: 'RACION' },
    { value: 'Art. Limpieza', label: 'ART. LIMPIEZA' },
    { value: 'Art. Veterinaria', label: 'ART. VETERINARIA' },
    { value: 'Semen', label: 'SEMEN' },
  ];
  const [show, setShow] = useState(false);
  const [permisos, setPermisos] = useState(null);
  const [foto, setFoto] = useState(null);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false
  });

  let cam;

  useEffect(() => {
    getPermisos();
  }, [])

  const validate = values => {
    const errors = {}

    if (values.tipo == 'Semen' && (!values.hba || values.hba == '')) {
      errors.hba = "INGRESE EL HBA"
    }
    return errors
  }

  //La funcion validate debe estar declarada antes del form sino no funciona
  const formRecepcion = useFormik({
    initialValues: {
      fecha: new Date(),
      fechaRecep: new Date(),
      tipo: 'Racion',
      obs: '',
      hba: '',

    },
    validate,
    onSubmit: datos => guardar(datos)
  });

  async function getPermisos() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermisos(status === 'granted')
  }

  async function tomarFoto() {
    if (!cam) return;
    const options = { quality: 0.5 };
    await cam.takePictureAsync({ quality: 0.7, onPictureSaved: onPictureSaved });
  }


  onPictureSaved = photo => {
    setFoto(photo.uri);
    setShow(false);
  }

  function eliminarFoto() {
    setFoto(null);
  }

  async function registrarToro(datos) {
    try {
      //Si el toro no está registrado lo doy de alta
      await firebase.db.collection('macho').where('idtambo', '==', tambo.id).where('hba', '==', datos.hba).get().then(snapshot => {
        if (snapshot.empty) {
          try {
            firebase.db.collection('macho').add({

              idtambo: tambo.id,
              cat: 'toro',
              hba: datos.hba
            });
          } catch (error) {
            setAlerta({
              show: true,
              titulo: '¡ ERROR !',
              mensaje: 'NO SE PUEDE DAR DE ALTA EL TORO',
              color: '#DD6B55'
            });
          }
        }
      });

    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE DAR DE ALTA EL TORO',
        color: '#DD6B55'
      });

    }


  }


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

    let obs = datos.obs;
    if (datos.tipo == 'Semen') obs = obs + ' -HBA: ' + datos.hba;
    let nombreFoto = '';

    try {
      if (foto) {
        //obtiene el nombre del archivo
        const posicionUltimaBarra = foto.lastIndexOf("/");
        const rutaRelativa = foto.substring(posicionUltimaBarra + "/".length, foto.length);
        nombreFoto = rutaRelativa;
        //configura el lugar de almacenamiento
        const storageRef = firebase.almacenamiento.ref();
        const archivoRef = storageRef.child(tambo.id + '/recepciones/' + nombreFoto);
        //recupera el archivo en un blob
        const response = await fetch(foto);
        const blob = await response.blob();
        //sube el archivo
        archivoRef.put(blob);

      }
      firebase.db.collection('tambo').doc(tambo.id).collection('recepcion').add({
        fecha: fecha,
        fechaRemito: fdate,
        tipo: datos.tipo,
        foto: nombreFoto,
        obs: obs,
        visto: false,
        usuario: usuario
      });
      if (datos.tipo == 'Semen') registrarToro(datos);
      setAlerta({
        show: true,
        titulo: '¡ATENCION!',
        mensaje: 'RECEPCIÓN REGISTRADA CON ÉXITO',
        color: '#3AD577',
        vuelve: true
      });


    } catch (error) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE REGISTRAR LA RECEPCIÓN',
        color: '#DD6B55'
      });
    }


  }

  function cambiarFecha(event, date) {
    const currentDate = date;
    setShowFecha(false); 
    setFecha(currentDate);
    formRecepcion.handleChange('fecha')
  };
const handlever = ()=> {
  setShowFecha(true);
}
let texto = format(fecha, 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.texto}>FECHA REMITO:</Text>
        <TouchableHighlight style={styles.calendario} onPress={handlever}>
          <View 
          
          ><Text style={styles.textocalendar}>{texto}</Text></View></TouchableHighlight>
        {showfecha && (
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
          <Text style={styles.texto}>TIPO:</Text>
      
          <RNPickerSelect
              items={tipos}
              onValueChange={formRecepcion.handleChange('tipo')}
              value={formRecepcion.values.tipo}

              placeholder={{
                label: 'SELECCIONAR TIPO',
                value: null,
                color: '#9EA0A4',
              }}
              style={styles.pickerStyle}
            />

        </View>
        {formRecepcion.values.tipo == 'Semen' &&
          <View>
            <Text style={styles.texto}>HBA:</Text>
            <TextInput
              style={styles.entrada}
              onChangeText={formRecepcion.handleChange('hba')}
              value={formRecepcion.values.hba.toString()}
            />
            {formRecepcion.errors.hba ? <Text style={styles.error}>{formRecepcion.errors.hba}</Text> : null}
          </View>


        }
        <View>
          <Text style={styles.texto}>OBSERVACIONES:</Text>
          <TextInput
            style={styles.entrada}
            onChangeText={formRecepcion.handleChange('obs')}
            value={formRecepcion.values.obs.toString()}
          />

        </View>
        <View style={styles.foto}>
          {!foto ?
            <Button
              title="  TOMAR FOTO"
              icon={
                <Icon
                  name="camera"
                  size={35}
                  color="#4db150"
                />
              }
              type="outline"
              onPress={() => setShow(true)}
            />
            :
            <>
              <View style={styles.vistaMiniatura}>
                <Image
                  style={styles.miniatura}
                  source={{ uri: foto }}
                />
              </View>
              <Button
                title="  ELIMINAR FOTO"
                icon={
                  <Icon
                    name="trash"
                    size={35}
                    color="#B00202"
                  />
                }
                type="outline"
                onPress={() => eliminarFoto()}
              />
            </>
          }
        </View>

        <Modal
          animationType='fade'
          transparent={true}
          visible={show}
        >
          <View style={styles.center}>
            <View style={styles.content}>
              <Camera
                style={styles.camara}
                type={Camera.Constants.Type.back}
                ref={ref => (cam = ref)}
              >

              </Camera>

              <View style={styles.columnas}>
                <View style={styles.colder}>
                  <Button

                    icon={
                      <Icon
                        name="camera"
                        size={35}
                        color="#4db150"
                      />
                    }
                    type="outline"
                    onPress={() => tomarFoto()}
                  />
                </View>
                <View style={styles.colder}>
                  <Button

                    icon={
                      <Icon
                        name="window-close"
                        size={35}
                        color="#B00202"
                      />
                    }
                    type="outline"
                    onPress={() => setShow(false)}
                  />
                </View>
              </View>
            </View>
          </View>

        </Modal>

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
        onPress={formRecepcion.handleSubmit}
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
    marginLeft: 5,
    marginTop: 10,

  },
  header: {
    marginTop: 5,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2980B9'
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
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#333',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,

  },
  boton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingTop: 5,
  },
  foto: {
    marginTop: 15,
  },
  center: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  content: {
    backgroundColor: '#eee',
    flex: 1,
    margin: 20,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15,

  },
  camara: {
    marginTop: 20,
    flex: 5
  },
  columnas: {
    flex: 1,
    flexDirection: 'row'
  },
  colder: {
    flex: 1,
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
  colizq: {
    marginTop: 2,
    flex: 3,
  },
  botonera: {
    flex: 1,
    backgroundColor: '#e1e8ee',
    paddingTop: 5,
  },
  miniatura: {
    width: 200,
    height: 200,
    borderColor: 'white',
    borderWidth: 1,


  },
  vistaMiniatura: {
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
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

  }

});
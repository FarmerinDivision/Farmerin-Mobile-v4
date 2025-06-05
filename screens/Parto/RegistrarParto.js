import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Modal, FlatList, TextInput, ScrollView, ActivityIndicator, Image, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import InfoAnimal from '../InfoAnimal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import CriaItem from './CriaItem';
import { format } from 'date-fns';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import RNPickerSelect from 'react-native-picker-select';
import { MovieContext } from "../Contexto"
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {
  const [fecha, setFecha] = useState(new Date());
  const [movies, setMovies,trata] = useContext(MovieContext)

  const route = useRoute();
  const {animal} = route.params;
  const {tambo} = route.params;
  const [showfecha, setShowFecha] = useState(false);
  const {usuario} = route.params;
    const [show, setShow] = useState(false);
  const [permisos, setPermisos] = useState(null);
  let cam;
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false
  });

  const [cria, setCria] = useState([]);
  const [iden, setIden] = useState(0);
  const [modal, setModal] = useState(false);
  const [tratamientoOptions, setTratamientoOptios] = useState([{ value: '', label: '' }]);
  const [loading, setLoading] = useState(false);

  const options = [
    { value: 'Normal', label: 'NORMAL' },
    { value: 'Dif. Intensa', label: 'DIF. INTENSA' },
    { value: 'Dif. Leve', label: 'DIF. LEVE' },
    { value: 'Cesárea', label: 'CESAREA' },
    { value: 'No sabe', label: 'NO SABE' },
    { value: 'Mala Presentación', label: 'MALA PRESENTACION' },
    { value: 'Mellizos', label: 'MELLIZOS' }
  ];

  const sexoOptions = [
    { value: 'Macho', label: 'MACHO' },
    { value: 'Hembra', label: 'HEMBRA' },
    { value: 'Macho Muerto', label: 'MACHO MUERTO' },
    { value: 'Hembra Muerta', label: 'HEMBRA MUERTA' },
  ];

  const calostroOptions = [
    { value: 'Calostro Madre', label: 'CALOSTRO MADRE' },
    { value: 'Calostro Congelado', label: 'CALOSTRO CONGELADO' }
  ];

  useEffect(() => {
    getPermisos();
  }, [])


  const formParto = useFormik({
    initialValues: {
      fecha: new Date(),
      tipo: 'Normal',
      tratamiento: '',
      obs: ''
    },
    onSubmit: datos => guardar(datos)
  });

  const validate = values => {
    const errors = {}

    if ((values.sexo != 'Macho' && values.sexo != 'Hembra') && !values.foto) {
      errors.foto = "DEBE TOMAR UNA FOTO"
    }
    if (values.peso && (values.peso < 1 || values.peso > 50)) {
      errors.peso = "REVISE EL PESO DE LA CRIA"
    }
    if (isNaN(values.peso)) {
      errors.peso = "REVISE EL PESO DE LA CRIA"
    }

    return errors
  }

  const formCria = useFormik({
    initialValues: {
      rp: '',
      sexo: 'Macho',
      peso: '',
      tratamiento: 'Calostro Madre',
      foto: '',
      obs: ''
    },
    validate,
    onSubmit: datos => guardarCria(datos)
  })

  useEffect(() => {

    //busca los animales preñados
    obtenerTratamientos();
  }, []);

  function obtenerTratamientos() {
    const filtrado = trata.filter(e => {
      return (
        e.tipo == "tratamiento"
      )
    });
    filtrado.map(doc => {
      let tr = {
        value: doc.descripcion,
        label: doc.descripcion
      }

      setTratamientoOptios(tratamientoOptions => [...tratamientoOptions, tr]);
    })
  }

  function cerrar() {
    //limpio el form
    formCria.setFieldValue('rp', '');
    formCria.setFieldValue('sexo', 'Macho');
    formCria.setFieldValue('peso', '');
    formCria.setFieldValue('tratamiento', 'Calostro Madre');
    formCria.setFieldValue('foto', '');
    formCria.setFieldValue('obs', '');
    setModal(true);
  }

  async function getPermisos() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermisos(status === 'granted')
  }

  async function tomarFoto() {
    if (!cam) return;
    const options = { quality: 0.5 };
    await cam.takePictureAsync({ quality: 0.7, onPictureSaved: onPictureSaved });
  }


  function onPictureSaved(photo) {

    formCria.setFieldValue('foto', photo.uri);
    setShow(false);
  }

  function eliminarFoto() {
    formCria.setFieldValue('foto', '');
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
      fstring = format(fecha, 'yyyy-MM-dd');
      fdate = datos.fecha;

    }


    let detalle = datos.tipo + ' /Trat: ' + datos.tratamiento + ' /Obs.: ' + datos.obs + '\n';
    if (cria.length == 0) {
      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: 'Debe ingresar una cría',
        color: '#DD6B55'
      });
     
    } else {
      if (cria.length == 2 && datos.tipo != 'Mellizos') {
        setAlerta({
          show: true,
          titulo: 'Error!',
          mensaje: 'Debe ingresar sólo una cría',
          color: '#DD6B55'
        });
      } else if (cria.length != 2 && datos.tipo == 'Mellizos') {
        setAlerta({
          show: true,
          titulo: 'Error!',
          mensaje: 'Debe ingresar dos crías',
          color: '#DD6B55'
        });
      } else {
        let base;
        let fbaja = '';
        let mbaja = '';
        let an;
        let hayError = false;
        let crias = [];

        //for (const c of cria) {
        cria.forEach(async c => {
          //seteo observaciones por cria
          let obs = '';
          if (c.obs) obs = c.obs;

          //if (c.sexo == 'Hembra' || c.sexo == 'Macho') {
          //Seteo la base de acuerdo al sexo
          if (c.sexo == 'Hembra' || c.sexo == 'Hembra Muerta') {
            base = 'animal';
            if (c.sexo == 'Hembra Muerta') {
              fbaja = fstring;
              mbaja = 'Muerto al nacer'
            }
            an = {
              ingreso: fstring,
              idtambo: tambo.id,
              rp: c.rp,
              erp: '',
              lactancia: 0,
              observaciones: obs,
              estpro: 'cria',
              estrep: 'vacia',
              fparto: '',
              fservicio: '',
              categoria: 'Vaquillona',
              racion: 0,
              fracion: '',
              nservicio: 0,
              uc: 0,
              fuc: '',
              ca: 0,
              anorm: '',
              fbaja: fbaja,
              mbaja: mbaja,
              rodeo: 0,
              sugerido: 0
            }
          } else {
            base = 'macho'
            if (c.sexo == 'Macho Muerto') {
              fbaja = fstring;
              mbaja = 'Muerto al nacer'
            }
            an = {
              ingreso: fstring,
              idtambo: tambo.id,
              cat: 'ternero',
              rp: c.rp,
              fbaja: fbaja,
              mbaja: mbaja,
              observaciones: obs,
            }
          }
          

          try {


            //guardo la foto en caso de que exista
            let nombreFoto = '';
            if (c.foto) {
              //obtiene el nombre del archivo
              const posicionUltimaBarra = c.foto.lastIndexOf("/");
              const rutaRelativa = c.foto.substring(posicionUltimaBarra + "/".length, c.foto.length);
              nombreFoto = rutaRelativa;
            }

            crias.push({
              id: c.id,
              rp: c.rp,
              sexo: c.sexo,
              peso: c.peso,
              trat: c.trat,
              foto: nombreFoto,
              observaciones: obs,
            });

            //insertar cria en base de datos
            firebase.db.collection(base).add(an);
            //Si tiene foto la almacena
            if (c.foto) {
              //configura el lugar de almacenamiento
              const storageRef = firebase.almacenamiento.ref();
              const archivoRef = storageRef.child(tambo.id + '/crias/' + nombreFoto);
              //recupera el archivo en un blob
              const response = await fetch(c.foto);
              const blob = await response.blob();
              //sube el archivo
              archivoRef.put(blob);
            }

          } catch (error) {
            hayError = true;
            setAlerta({
              show: true,
              titulo: 'Error!',
              mensaje: 'Al regsitrar la cría',
              color: '#DD6B55'
            });
          }
          //}
        });

        if (!hayError) {
          //actualizar animal
          let cat;
          let lact = parseInt(animal.lactancia) + 1;
          if (lact > 1) {
            cat = 'Vaca'
          } else {
            cat = 'Vaquillona';
          }

          an = {
            lactancia: lact,
            estpro: 'En Ordeñe',
            estrep: 'vacia',
            fparto: fstring,
            fservicio: '',
            categoria: cat,
            nservicio: 0
          }

          try {
            let objIndex = movies.findIndex((obj => obj.id == animal.id));
            const copia = [...movies]
            const obj = copia[objIndex]
            const nuevo = Object.assign({},obj, an)
            copia[objIndex]=nuevo
            setMovies(copia)
            firebase.db.collection('animal').doc(animal.id).update(an);
            firebase.db.collection('animal').doc(animal.id).collection('eventos').add({
              fecha: fecha,
              tipo: 'Parto',
              detalle: detalle,
              crias: crias, 
              usuario: usuario
            })
            setAlerta({
              show: true,
              titulo: 'Atención!',
              mensaje: 'Parto registrado con éxito',
              color: '#3AD577',
              vuelve: true
            });

          } catch (error) {
            setAlerta({
              show: true,
              titulo: 'Error!',
              mensaje: 'No se puederegistrar el parto',
              color: '#DD6B55'
            });

          }
        }
      }
    }
  }

  async function guardarCria(datos) {
    setLoading(true);
    let errores = false;
    let descerror = '';
    let base;
    setIden(iden + 1);
    const c = {
      id: iden.toString(),
      rp: datos.rp,
      peso: datos.peso,
      sexo: datos.sexo,
      trat: datos.tratamiento,
      foto: datos.foto,
      obs: datos.obs,
    }

    //if (c.sexo == 'Hembra' || c.sexo == 'Macho') {
    //Seteo la base de acuerdo al sexo
    if (c.sexo == 'Hembra' || c.sexo == 'Hembra Muerta') {
      base = 'animal'
    } else {
      base = 'macho'
    }
    movies.forEach((e)=>{
    if (c.rp == e.rp && c.rp != "") {
            errores = true;
            descerror = 'El RP ' + c.rp + ' ya se encuentra asociado a un animal';
          }
        });
    //}
    if (errores) {
      setAlerta({
        show: true,
        titulo: 'Error!',
        mensaje: descerror,
        color: '#DD6B55'
      });
      setLoading(false);
    } else {
      setCria(cria => [...cria, c]);
      setLoading(false);
      setModal(false);
    }
    //limpio el form
    formCria.setFieldValue('rp', '');
    formCria.setFieldValue('sexo', 'Macho');
    formCria.setFieldValue('peso', '');
    formCria.setFieldValue('tratamiento', '');
    formCria.setFieldValue('foto', '');
    formCria.setFieldValue('obs', '');

  }
  function cambiarFecha(event, date) {
    const currentDate = date;
    setShowFecha(false); 
    setFecha(currentDate);
    formParto.handleChange('fecha')
  };
const handlever = ()=> {
  setShowFecha(true);
}
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
                borderColor: 'white',
                borderRadius: 10,
                backgroundColor: 'white',
                borderColor: 'grey',
                borderWidth: 1,
              }
            }}
          /> )}
          <View>
            <Text style={styles.texto}>TIPO:</Text>

            <RNPickerSelect
              items={options}
              onValueChange={formParto.handleChange('tipo')}
              value={formParto.values.tipo}

              placeholder={{}}
              style={styles.pickerStyle}
            />
          </View>
          <View>
            <Text style={styles.texto}>TRATAMIENTO:</Text>

            <RNPickerSelect
              items={tratamientoOptions}
              onValueChange={formParto.handleChange('tratamiento')}
              value={formParto.values.tratamiento}

              placeholder={{}}
              style={styles.pickerStyle}
            />
          </View>
          <View>
            <Text style={styles.texto}>OBSERVACIONES:</Text>
            <TextInput
              style={styles.entrada}
              onChangeText={formParto.handleChange('obs')}
              value={formParto.values.obs}
            />
          </View>
          <Text></Text>
          {cria.length < 2 &&
            <Button
              title="  AGREGAR CRIA"
              icon={
                <Icon
                  name="plus-square"
                  size={35}
                  color="#3390FF"
                />
              }
              type="outline"
              onPress={() => cerrar()}
            />
          }

          {cria.length != 0 &&
            <>
              <Text style={styles.texto}>CRIAS:</Text>
              <FlatList
                data={cria}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <CriaItem
                    data={item}
                    cria={cria}
                    setCria={setCria}
                  />
                )
                }
                ItemSeparatorComponent={() => <Separator />}
              />
            </>

          }
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
        onPress={
          formParto.handleSubmit}
      />

      <Modal
        animationType='fade'
        transparent={true}
        visible={modal}
      >
        {loading ?
          <ActivityIndicator size="large" color='#1b829b' />
          :
          <View style={styles.center}>
            <View style={styles.content}>

              <ScrollView>
                <View>
                  <View style={styles.columnas}>
                    <View style={styles.colizq}>
                      <Text style={styles.header}>DATOS DE LA CRIA</Text>
                    </View>
                    <View style={styles.colder}>
                      <Button
                        onPress={() => setModal(false)}
                        type="clear"
                        icon={
                          <Icon
                            name="window-close"
                            size={30}
                            color="#3390FF"
                          />
                        }
                      />
                    </View>
                  </View>

                  <Text style={styles.texto}>SEXO:</Text>

                  <RNPickerSelect
                    items={sexoOptions}
                    onValueChange={formCria.handleChange('sexo')}
                    value={formCria.values.sexo}

                    placeholder={{}}
                    style={styles.pickerStyle}
                  />
                  <Text style={styles.texto}>RP:</Text>
                  <TextInput
                    style={styles.entrada}
                    onChangeText={formCria.handleChange('rp')}
                  />
                  {formCria.errors.rp ? <Text style={styles.error}>{formCria.errors.rp}</Text> : null}

                  <Text style={styles.texto}>PESO:</Text>
                  <TextInput
                    style={styles.entrada}
                    onChangeText={formCria.handleChange('peso')}
                    keyboardType="numeric"
                  />
                  {formCria.errors.peso ? <Text style={styles.error}>{formCria.errors.peso}</Text> : null}
                  <Text style={styles.texto}>CALOSTRO:</Text>

                  <RNPickerSelect
                    items={calostroOptions}
                    onValueChange={formCria.handleChange('tratamiento')}
                    value={formCria.values.tratamiento}

                    placeholder={{}}
                    style={styles.pickerStyle}
                  />
                </View>
                <View>
                  <Text style={styles.texto}>OBSERVACIONES:</Text>
                  <TextInput
                    style={styles.entrada}
                    onChangeText={formCria.handleChange('obs')}
                    value={formCria.values.obs}
                  />
                </View>
                <Text></Text>
                <View style={styles.foto}>
                  {!formCria.values.foto ?
                    <Button
                      title="  TOMAR FOTO"
                      icon={
                        <Icon
                          name="camera"
                          size={35}
                          color="#3390FF"
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
                          source={{ uri: formCria.values.foto }}
                        />
                      </View>
                      <Button
                        title="  ELIMINAR FOTO"
                        icon={
                          <Icon
                            name="trash"
                            size={35}
                            color="#3390FF"
                          />
                        }
                        type="outline"
                        onPress={() => eliminarFoto()}
                      />
                    </>
                  }

                </View>
                {formCria.errors.foto ? <Text style={styles.error}>{formCria.errors.foto}</Text> : null}
                <Text></Text>



              </ScrollView>
              <Button
                title="  ACEPTAR"
                style={styles.boton}
                icon={
                  <Icon
                    name="check-square"
                    size={35}
                    color="white"
                  />
                }
                onPress={formCria.handleSubmit}
              />
              <Text></Text>
            </View>

          </View>
        }
      </Modal>
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
            <Text></Text>
            <View style={styles.columnas}>
              <View style={styles.colder}>
                <Button
                  style={styles.boton}
                  type="outline"
                  icon={
                    <Icon
                      name="camera"
                      size={35}
                      color="#3390FF"
                    />
                  }
                  onPress={() => tomarFoto()}
                />
              </View>

              <View style={styles.colder}>
                <Button
                  style={styles.boton}
                  type="outline"
                  icon={
                    <Icon
                      name="window-close"
                      size={35}
                      color="#3390FF"
                    />
                  }
                  onPress={() => setShow(false)}
                />
              </View>
            </View>
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
        cancelText="No, cancel"
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
const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#399dad' }}></View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',


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
    width: '100%',
    marginTop: 10,
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
    color: 'red',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',

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
  columnas: {
    flex: 1,
    flexDirection: 'row'
  },
  colder: {
    flex: 1,
  },
  colizq: {
    marginTop: 2,
    flex: 3,
  },
  camara: {
    marginTop: 20,
    flex: 5
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
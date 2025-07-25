import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { SearchBar } from 'react-native-elements';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
//import 'expo-firestore-offline-persistence';


import firebase from '../../database/firebase';
import ListAnimales from './ListAnimales';
import ListAnimalesOrd from './ListAnimalesOrd';
import ListItemTolvas from './ListItemTolvas';
import { format } from 'date-fns';
import { encode } from 'base-64';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import { useRoute } from '@react-navigation/core';


export default ({ navigation }) => {

  const route = useRoute();
  const { tambo } = route.params;
  const { control } = route.params;
  const { usuario } = route.params;

  const [loading, setLoading] = useState(false);
  const [animalesControl, setAnimalesControl] = useState([]);
  const [animalesFilter, guardarAnimalesFilter] = useState([]);
  const [confirmacion, mostrarConfirmacion] = useState(false);
  const [verLado, setVerLado] = useState(false);
  const [addAnimal, setAddAnimal] = useState(false);
  const [fechaCon, setFechaCon] = useState('');
  const [rp, guardarRP] = useState('');
  const [rpOrd, guardarRPOrd] = useState('');
  const [animalesOrd, setAnimalesOrd] = useState([]);
  const [animalesOrdFilter, setAnimalesOrdFilter] = useState([]);
  const [tolvasDer, guardarTolvasDer] = useState([]);
  const [tolvasIzq, guardarTolvasIzq] = useState([]);
  const [verLadoControl, setVerLadoControl] = useState(false);
  const [ladoControl, setLadoControl] = useState('');
  const [showBotones, setshowBotones] = useState(true);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55',
    vuelve: false
  });

  useEffect(() => {
    if (control.estado) {
      setshowBotones(false);
    }
    if (!global.btoa) {
      global.btoa = encode;
    }
    const f = new Date(control.fecha.toDate());
    const ff = format(f, 'dd/MM/yyyy')
    setFechaCon(ff);
    //busca los registros del control lechero
    obtenerRegistros();
    obtenerAnimalesOrd();
  }, []);


  useEffect(() => {
    guardarAnimalesFilter(animalesControl);
  }, [animalesControl])

  useEffect(() => {
    setAnimalesOrdFilter(animalesOrd);
  }, [animalesOrd])

  function obtenerRegistros() {
    setLoading(true);
    try {
      firebase.db.collection('tambo').doc(tambo.id).collection('control').doc(control.id).collection('animalesControl').orderBy('rp', 'desc').get().then(snapshotControl)
    } catch (e) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE OBTENER EL CONTROL',
        color: '#DD6B55'
      });
    }
  }


  function snapshotControl(snapshot) {
    const ac = snapshot.docs.map(doc => {

      return {
        id: doc.id,
        ...doc.data()
      }

    })
    setAnimalesControl(ac);
    setLoading(false);
  };

  function obtenerAnimalesOrd() {
    setLoading(true);
    try {
      firebase.db.collection('animal').where('idtambo', '==', tambo.id).where('estpro', '==', 'En Ordeñe').where('fbaja', '==', '').orderBy('rp').get().then(snapshotOrd)
    } catch (e) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDEN OBTENER LOS ANIMALES EN ORDEÑE',
        color: '#DD6B55'
      });
    }
  }


  function snapshotOrd(snapshot) {
    const ao = snapshot.docs.map(doc => {

      return {
        id: doc.id,
        ...doc.data()
      }

    })
    setAnimalesOrd(ao);
  };

  function updateSearchOrd(rpOrd) {
    if (rpOrd) {
      const cond = rpOrd.toLowerCase();
      const filtro = animalesOrd.filter(animal => {
        return (
          animal.rp.toString().toLowerCase().includes(cond)
        )
      });
      setAnimalesOrdFilter(filtro);
      guardarRPOrd(rpOrd);
    } else {
      setAnimalesOrdFilter(animalesOrd);
      guardarRPOrd(rpOrd);
    }

  };

  function updateSearch(rp) {
    if (rp) {
      const cond = rp.toLowerCase();
      const filtro = animalesControl.filter(animal => {
        return (
          animal.rp.toString().toLowerCase().includes(cond)
        )
      });
      guardarAnimalesFilter(filtro);
      guardarRP(rp);
    } else {
      guardarAnimalesFilter(animalesControl);
      guardarRP(rp);
    }

  };


  function confirmarControl() {
    setLoading(true);
    mostrarConfirmacion(false);
    const fecha = new Date(control.fecha.toDate());
    let erp;
    let error = false;
    let detalle;
    animalesControl.forEach(ac => {
      detalle = "";
      erp = ac.erp.toString();

      try {
        firebase.db.collection('animal').where('idtambo', '==', tambo.id).where('erp', 'in', [erp, ac.erp]).get().then(snapshot => {
          if (!snapshot.empty) {
            snapshot.forEach(doc => {

              const valores = {
                uc: parseFloat(ac.ltsm) + parseFloat(ac.ltst),
                fuc: fecha,
                ca: doc.data().uc,
                anorm: ac.anorm,
              }
              try {
                detalle = valores.uc + " lts."
                if (ac.anorm) {
                  detalle = detalle + "-Anorm: " + ac.anorm
                }
                firebase.db.collection('animal').doc(doc.id).update(valores);
                try {
                  firebase.db.collection('animal').doc(doc.id).collection('eventos').add({
                    fecha: fecha,
                    tipo: 'Control Lechero',
                    detalle: detalle,
                    usuario: usuario
                  })
                } catch (e) {
                  console.log(e);
                }

              } catch (e) {

                error = true;

              }
            });

          } else {
            setAlerta({
              show: true,
              titulo: '¡ ERROR !',
              mensaje: 'NO HAY ANIMALES PARA CONFIRMAR',
              color: '#DD6B55'
            });
          }

        });
      } catch (e) {

        error = true;

      }
    });

    setLoading(false);
    if (error) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE CONFIRMAR EL COONTROL LECHERO',
        color: '#DD6B55'
      });

    } else {
      try {
        firebase.db.collection('tambo').doc(tambo.id).collection('control').doc(control.id).update({ estado: true });

      } catch (e) {

        error = true;

      }
      if (error) {

        setAlerta({
          show: true,
          titulo: '¡ ERROR !',
          mensaje: 'NO SE PUEDE CONFIRMAR EL CONTROL LECHERO',
          color: '#DD6B55'
        });
      } else {
        setAlerta({
          show: true,
          titulo: '¡ATENCION!',
          mensaje: 'CONTROL LECHERO CONFIRMADO CON ÉXITO ',
          color: '#3AD577',
          vuelve: true
        });
      }

    }

  }

  function updateControl(identificador, ac) {
    let a = {
      ltsm: ac.ltsm,
      ltst: ac.ltst,
      anorm: ac.anorm
    }
    try {

      firebase.db.collection('tambo').doc(tambo.id).collection('control').doc(control.id).collection('animalesControl').doc(identificador).update(a);

    } catch (e) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'AL ACTUALIZAR EL CONTROL',
        color: '#DD6B55'
      });

    }
    guardarRP('');
  }

  function quitarAnimalControl(identificador) {
    try {

      firebase.db.collection('tambo').doc(tambo.id).collection('control').doc(control.id).collection('animalesControl').doc(identificador).delete();

    } catch (e) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'AL ACTUALIZAR EL CONTROL',
        color: '#DD6B55'
      });

    }
    guardarRP('');
  }


  function addAnimalControl(animal) {
    let erp = animal.erp.toString();
    const existe = animalesControl.filter(a => {

      return (
        a.erp.toString().includes(erp)
      )
    });

    if (existe.length > 0) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'EL ANIMAL YA ESTA REGISTRADO EN EL CONTROL',
        color: '#DD6B55'
      });

    } else {
      const ac = {
        anorm: '',
        erp: animal.erp,
        ltsm: 0,
        ltst: 0,
        rp: animal.rp
      }
      nuevoControl(ac);

      setAddAnimal(false);

    }

  }

  function nuevoControl(ac) {

    try {
      firebase.db.collection('tambo').doc(tambo.id).collection('control').doc(control.id).collection('animalesControl').add(ac);

    } catch (e) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'Al agregar el animal',
        color: '#DD6B55'
      });

    }
    obtenerRegistros();
  }

  async function animalesEnTambo() {
    guardarTolvasIzq([]);
    guardarTolvasDer([]);
    setLoading(true);
    //tolvas lado izquierdo
    let url = 'http://' + tambo.host + '/ordenie/1';
    let url2 = 'http://' + tambo.host + '/ordenie/2';
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {

      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const t1 = await api.json();
      const ti = t1.map(t => {

        return {
          id: t.rfid,
          orden: t.orden,
          rp: t.racion.RP,

        }

      });
      //tolvas lado izquierdo
      guardarTolvasIzq(ti);

      //tolvas lado derecho
      const api2 = await fetch(url2, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const t2 = await api2.json();
      const td = t2.map(t => {

        return {
          id: t.rfid,
          orden: t.orden,
          rp: t.racion.RP,

        }

      });
      //tolvas lado derecho
      guardarTolvasDer(td);

    } catch (e) {
      setAlerta({
        show: true,
        titulo: '¡ ERROR !',
        mensaje: 'NO SE PUEDE CONECTAR AL TAMBO',
        color: '#DD6B55'
      });

    }
    setLoading(false);
    setVerLado(true);

  }


  function verTolvas(lado) {

    if (tolvasDer.length > 0 && lado == 'der') {
      setVerLado(false);
      setVerLadoControl(true);
      setLadoControl(lado);
    }
    if (tolvasIzq.length > 0 && lado == 'izq') {
      setVerLado(false);
      setVerLadoControl(true);
      setLadoControl(lado);

    }

  }

  function volverAnimalesOrd() {
    setVerLadoControl(false);
    obtenerRegistros();
  }

  return (
    <View style={styles.container}>
      <View style={styles.contenido}>
        <Text style={styles.fechaControl}>FECHA CONTROL: {fechaCon} </Text>
        <SearchBar
          placeholder="Buscar por RP"
          onChangeText={updateSearch}
          value={rp}
          lightTheme
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInput}
        />
        {loading ? (
          <ActivityIndicator size="large" color='#1b829b' />
        ) : (
          <SafeAreaView>
            {animalesFilter.length === 0 && (
              <Text style={styles.alerta}>NO SE ENCONTRARON ANIMALES</Text>
            )}
            <FlatList
              data={animalesFilter}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ListAnimales
                  data={item}
                  updateControl={updateControl}
                  obtenerRegistros={obtenerRegistros}
                  control={control}
                  setshowBotones={setshowBotones}
                  quitarAnimalControl={quitarAnimalControl}
                />
              )}
              ItemSeparatorComponent={() => <Separator />}
            />
          </SafeAreaView>
        )}

        {/* Modal de Confirmación */}
        <Modal animationType='fade' transparent visible={confirmacion}>
          <View style={styles.center}>
            <View style={styles.content}>
              <Text style={styles.text2}>CONFIRMAR EL CONTROL LECHERO?</Text>
              <Button
                title="  SI"
                icon={<Icon name="check-square" size={35} color="white" />}
                onPress={confirmarControl}
                buttonStyle={styles.buttonConfirm}
              />
              <Text></Text>
              <Button
                onPress={() => mostrarConfirmacion(false)}
                type="outline"
                title=" NO"
                icon={<Icon name="window-close" size={30} color="#2980B9" />}
                buttonStyle={styles.buttonOutline}
              />
            </View>
          </View>
        </Modal>

        {/* Otros modales y contenido omitido para brevedad */}

        {(showBotones && !loading) && (
          <View style={styles.botones}>
            <Button
              title="  ANIMALES EN ORDEÑE"
              type="outline"
              icon={<Icon name="th-large" size={35} color="#FAF9FF" />}
              onPress={() => animalesEnTambo()}
              buttonStyle={styles.buttonPrimary}
              titleStyle={styles.buttonTitle}
            />
            <Text style={styles.text3}></Text>
            <Button
              title="  AGREGAR ANIMAL"
              type="outline"
              icon={<Icon name="plus-square" size={35} color="#FAF9FF" />}
              onPress={() => setAddAnimal(true)}
              buttonStyle={styles.buttonPrimary}
              titleStyle={styles.buttonTitle}
            />
            {animalesControl.length > 0 && (
              <SafeAreaView>
                <Text style={styles.text3}></Text>
                <Button
                  title="  CONFIRMAR CONTROL"
                  type="outline"
                  icon={<Icon name="check-square" size={35} color="#FAF9FF" />}
                  onPress={() => mostrarConfirmacion(true)}
                  buttonStyle={styles.buttonPrimary}
                  titleStyle={styles.buttonTitle}
                />
              </SafeAreaView>
            )}
          </View>
        )}

        {/* Alert Component */}
        {alerta && (
          <Modal
            isVisible={!!alerta.show}
            onBackdropPress={() => setAlerta({ ...alerta, show: false })}
            onBackButtonPress={() => setAlerta({ ...alerta, show: false })}
          >
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: alerta.color }}>{alerta.titulo}</Text>
              <Text style={{ marginVertical: 10 }}>{alerta.mensaje}</Text>  {/* ✅ CORRECTO */}
              <Button
                title="ACEPTAR"
                onPress={() => {
                  if (alerta.vuelve) {
                    navigation.goBack();
                  } else {
                    setAlerta({ ...alerta, show: false });
                  }
                }}
                buttonStyle={{ backgroundColor: '#DD6B55', marginTop: 10 }}
              />
            </View>
          </Modal>

        )}
      </View>
    </View>
  );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  contenido: {
    flex: 4,
    padding: 10,
  },
  botones: {
    paddingTop: 10,
    flex: 2,
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  fechaControl: {
    backgroundColor: '#4db150',
    fontSize: 16,
    color: 'white',
    paddingVertical: 5,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#e1e8ee',
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  text2: {
    color: '#FAF9FF',
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10,
  },
  buttonPrimary: {
    backgroundColor: '#2980B9',
    borderRadius: 8,
  },
  buttonOutline: {
    borderColor: '#2980B9',
  },
  buttonTitle: {
    color: '#FAF9FF',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});
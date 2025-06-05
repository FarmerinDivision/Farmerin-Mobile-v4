import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, FlatList, ActivityIndicator, Image, Linking } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encode } from 'base-64';
import SelectTambo from './SelectTambo';
import { connect } from 'react-redux';
import { selectTambo } from '../src/reducers/tambo';
import AwesomeAlert from 'react-native-awesome-alerts';

const Config = ({ navigation, tambo, selectTambo }) => {
  const [showTambos, setShowTambos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {
    if (!global.btoa) {
      global.btoa = encode;
    }
  }, []);

  const opciones = [
    { id: '0', nombre: 'CAMBIO DE BOTÓN ELECTRÓNICO ( eRP )', accion: 'CambiarBotonElec' },
    { id: '1', nombre: 'ANIMALES', accion: 'Animales' },
    { id: '2', nombre: 'MONITOR DE INGRESO', accion: 'MonitorIngreso' },
    { id: '3', nombre: 'CONTROL DE INGRESO', accion: 'ControlDeIngreso' },
    { id: '4', nombre: 'CONTROL LECHERO', accion: 'ControlLechero' },
    { id: '5', nombre: 'MANTENIMIENTO DE COMEDEROS', accion: 'MantdeComederos' },
    { id: '6', nombre: 'CALIBRACIÓN DE COMEDEROS', accion: 'Calibracion' },
    { id: '7', nombre: 'SELECCIONAR TAMBO', accion: '' },
    { id: '9', nombre: 'AYUDA', accion: 'Ayuda' },
    { id: '10', nombre: 'PREFERENCIAS', accion: 'Preferencias' },
    { id: '11', nombre: 'CERRAR SESION', accion: '' },
  ];

  function ListItemOpciones({ data, tambo }) {
    const { nombre, id, accion } = data;

    const funcionalidad = () => {
      if (id == '7') {
        setShowTambos(true);
      } else if (id == '11') {
        setAlerta({
          show: true,
          titulo: 'Atención!',
          mensaje: 'Desea cerrar Sesión?',
          color: '#3AD577'
        });
      } else if (id == 8) {
        Linking.openURL("https://farmerin-navarro.web.app/")
      } else {
        navigation.push(accion, { tambo });
      }
    };

    return (
      <TouchableOpacity onPress={funcionalidad} style={styles.touchable}>
        <View style={styles.containerList}>
          <Text style={styles.textList}>{nombre}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color='#1b829b' />
      ) : (
        <>
          <View style={styles.tambo}>
            <Text style={styles.textTambo}>{tambo.nombre}</Text>
          </View>
          <View style={styles.list}>
            <FlatList
              data={opciones}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ListItemOpciones data={item} tambo={tambo} />
              )}
              ItemSeparatorComponent={() => <Separator />}
            />
          </View>
          <View style={styles.footer}>
            <Text style={styles.textVersion}>Version 4.0.0</Text>
            <Text style={styles.textVersion}>Farmerin Division S.A. - &copy; 2020</Text>
          </View>
        </>
      )}
      {showTambos && <SelectTambo setShowTambos={setShowTambos} showTambos={showTambos} selectTambo={selectTambo} />}
      <AwesomeAlert
        show={alerta.show}
        showProgress={false}
        title={alerta.titulo}
        message={alerta.mensaje}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="CANCELAR"
        confirmText="ACEPTAR"
        confirmButtonColor={alerta.color}
        cancelButtonColor={'#DD6B55'}
        onCancelPressed={() => setAlerta({ show: false })}
        onConfirmPressed={() => {
          setAlerta({ show: false });
          AsyncStorage.removeItem('usuario');
          AsyncStorage.removeItem('nombre');
          navigation.navigate('OnBoarding');
        }}
      />
    </View>
  );
};

const Separator = () => <View style={styles.separator}></View>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  tambo: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#4cb050',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  textTambo: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  list: {
    flex: 8,
    paddingHorizontal: wp('4%'),
  },
  footer: {
    alignItems: 'center',
    paddingVertical: hp('1%'),
  },
  textVersion: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  touchable: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  containerList: {
    backgroundColor: '#fff',
    padding: hp('2%'),
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  textList: {
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: hp('0.5%'),
  },
});

const mapStateToProps = state => {
  return { tambo: state.tambo }
}
const mapDispatchToProps = dispatch => ({
  selectTambo: (tambo) => dispatch(selectTambo(tambo))
})
export default connect(mapStateToProps, mapDispatchToProps)(Config);

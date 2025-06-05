import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ListItemAnimalesOrd({ data, addAnimalControl }) {

  const { rp, erp } = data;

  return (
    <TouchableOpacity onPress={() => addAnimalControl(data)}>
      <View style={styles.container}>
        <Text style={styles.text}>RP: {rp} - eRP: {erp}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e8ee',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8, // Añadido para mejorar el diseño
    marginBottom: 10, // Añadido para separar los elementos
  },
  text: {
    fontSize: 16,
    color: '#2980B9',
    fontWeight: 'bold', // Añadido para destacar el texto
  },
  leftAction: {
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 8, // Añadido para redondear las esquinas
  },
  actionText: {
    fontSize: 16,
    color: '#FFF',
    padding: 20,
    textAlign: 'center', // Centrado del texto para una mejor visualización
  },
  header: {
    backgroundColor: '#2980B9',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  content: {
    backgroundColor: '#e1e8ee',
    borderWidth: 1,
    borderColor: 'white',
    margin: 20,
    marginTop: hp('10%'),
    borderRadius: 15,
    height: hp('60%'),
  },
  center: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  text2: {
    color: '#e1e8ee',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 5,
    marginBottom: 5,
  },
  entrada: {
    marginHorizontal: 5, // Simplificado usando marginHorizontal
    borderRadius: 10,
    backgroundColor: 'white',
    height: 50,
    borderWidth: 1,
    borderColor: 'grey',
    paddingLeft: 5,
  },
  columnas: {
    flexDirection: 'row',
  },
  colder: {
    flex: 1,
    marginTop: 2,
  },
  colizq: {
    marginTop: 2,
    flex: 1,
  },
  texto: {
    fontSize: 16,
    paddingLeft: 5,
    color: 'black',
  },
  error: {
    marginHorizontal: 5, // Simplificado usando marginHorizontal
    fontSize: 13,
    borderRadius: 5,
    color: 'red',
    backgroundColor: 'pink',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'red',
  },
});

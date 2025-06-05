import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight  } from 'react-native';
import { getAuth, deleteUser } from "firebase/auth";
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListSesiones({data}) {

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
        <Text style={styles.text}>{data.nombre}  :  {data.logueos}</Text>
        </View>
      </View> 
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e8ee',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  text: {
    fontSize: 20,
    color: '#070037',
    textTransform: 'uppercase'
    
  },

  logo:{
    marginRight: 35,
    width: 33,
    height: 33,
    marginLeft: 13
  },
  row:{
flexDirection: "row"
  },

});
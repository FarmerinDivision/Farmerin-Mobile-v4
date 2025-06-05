import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


export default function ListItem({ data,seleccionar}) {

  const { id, nombre,host } = data;
  
   return (
    <>
    <Separator />
    <TouchableOpacity onPress={seleccionar}>
      <View style={styles.container}>
        <Text style={styles.text}> {nombre} </Text>
      </View>
    </TouchableOpacity>
   
   </>

  )
}
const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#287fb9' }}></View>
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e8ee',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  text: {
    fontSize: 16,
    color: '#070037'
  },

});
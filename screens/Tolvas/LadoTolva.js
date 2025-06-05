import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
//import { forModalPresentationIOS } from 'react-navigation-stack/lib/typescript/src/vendor/TransitionConfigs/CardStyleInterpolators';
import ListItem from './ListItem';
import {decode, encode} from 'base-64';
import { useRoute } from '@react-navigation/core';


export default ({ navigation }) => {
 
  const route = useRoute();
  const {host} = route.params;
  const {tolvas} = route.params;
  const {lado} = route.params;
  const {racionMotor} = route.params;
  const {tambo} = route.params;
  console.log('IN CLUIDOS',route.params); // Esto mostrará si `tambo` está incluido

  useEffect(() => {
    if (!global.btoa) {
      global.btoa = encode;
    }

  }, []);


  return (
    <View style={styles.container}>
  
 
  <FlatList
  data={tolvas}
  keyExtractor={item => item.Id}
  renderItem={({ item }) => (
    <ListItem
      data={item}
      host={host}
      racionMotor={racionMotor}
      tambo={tambo} // Agregar tambo aquí
    />
  )}
/>
          
      
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e8ee',

  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#868584',
    paddingHorizontal: 10,
    paddingVertical: 15,

  },
});
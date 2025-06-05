import React, {useState,useEffect} from 'react';
import { View, Text, StyleSheet, } from 'react-native';

export default function ListItem({ data }) {
  const [estado,setEstado]=useState('A');
  const {  rp,erp, tipo } = data;
  
  useEffect(() => {
    if (tipo=='ingreso') {
      setEstado('S');
    }
    

  }, []);

  
   return (
  
      <View style={styles.container}>
        <Text style={{color: estado=='S' ? '#ED5D23' : '#F52D2A',fontSize: 16 }}>RP: {rp} - eRP: {erp} - {estado} </Text>
      </View>

  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e8ee',
    paddingHorizontal: 5,
    paddingVertical:10,
  },
});
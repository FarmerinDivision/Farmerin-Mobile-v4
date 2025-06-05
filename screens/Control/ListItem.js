import React,{useEffect,useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'

export default function ListItem({data,listarControles}) {

  const { id, fecha,estado } = data;
  const [fechaCon,setFechaCon]=useState('');

  useEffect(() => {
    const f = new Date(fecha.toDate());
    const ff=format(f, 'dd/MM/yyyy')
    setFechaCon(ff);
    
  }, []);
 

  return (
    <TouchableOpacity onPress={listarControles} style={styles.touchable}>
      <View style={styles.container}>
        <Text style={styles.text}>
          {fechaCon} - {estado ? 'CONFIRMADO' : 'PENDIENTE'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    color: '#070037',
    fontWeight: '500',
  },
  leftAction: {
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

});
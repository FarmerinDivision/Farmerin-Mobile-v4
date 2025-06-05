import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';

export default function ListItem({ data,registrarRechazo}) {

  const { id, rp,fservicio,estrep,estpro,categoria,lactancia } = data;
  const [parto, setParto] = useState(false);
  const [siglas, guardarSiglas] =useState({
    cat:'VC',
    prod: 'S',
    rep: 'V'
  })

  useEffect(() => {

    let c='VC';
    let p='S';
    let r='V';

    if (categoria!='Vaca') c='VQ';
    if (estpro!='seca') p='O';
    if (estrep!='vacia') r='P'

    guardarSiglas({
      cat:c,
      prod: p,
      rep: r
    })
      
  }, []);




  return (
    <TouchableHighlight
      onPress={registrarRechazo}
       

    >
      <View style={styles.container}>
        <Text style={styles.text}>RP: {rp} ({siglas.cat}/{siglas.prod}/{siglas.rep}) - LACT: {lactancia} </Text>
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // Fondo blanco para los elementos
    borderRadius: 15, // Bordes redondeados
    padding: 15, // Espacio interno
    marginBottom: 1, // Espacio entre elementos
    shadowColor: '#000', // Sombra para darle profundidad
    shadowOffset: { width: 0, height: 5 }, // Offset de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 10, // Difusión de la sombra
    elevation: 5, // Elevación en Android
    borderWidth: 1, // Borde definido
    borderColor: '#e0e0e0', // Color del borde
  },
  text: {
    fontSize: 16,
    color: '#333', // Color oscuro para el texto
  },
  leftAction: { 
    backgroundColor: '#FFF',
    justifyContent: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#FFF',
    padding: 15,
  },

});
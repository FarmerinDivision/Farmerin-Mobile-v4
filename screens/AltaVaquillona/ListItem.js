import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'

export default function ListItem({ data, animales, guardarAnimales }) {

  const { id, rp,cambiar,ingreso } = data;
  const [nacim,setNacim]=useState('');
  
  useEffect(() => {

    if (ingreso){
      const n = format(new Date(ingreso+'T00:00:00.00-03:00'), 'dd/MM/yy');
      //const n =new Date(ingreso).toUTCString(); 
      setNacim(n);
    }else{
      setNacim('-')
    }

      
  }, []);

  function cancelCambio() {
    if (cambio) {
      const animalesAct = animales.map(a => {
        // Revisamos que la llave recibida coincida con el elemento que queremos actualizar
        if (a.id === id) {
          a.cambiar = false;
        }
        // Si no es el elemento que deseamos actualizar lo regresamos tal como está
        return a;
      });

      guardarAnimales(animalesAct);
    }
  }

  function cambio() {
    if (!cambiar) {
      const animalesAct = animales.map(a => {
        // Revisamos que la llave recibida coincida con el elemento que queremos actualizar
        if (a.id === id) {
          a.cambiar = true;
        }
        // Si no es el elemento que deseamos actualizar lo regresamos tal como está
        return a;
      });

      guardarAnimales(animalesAct);

    }
  }

  return (
    <>
      {cambiar ? (
        <TouchableOpacity style={styles.containerChanged} onPress={cancelCambio}>
          <Text style={styles.textChanged}>RP: {rp} - NACIMIENTO: {nacim}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={cambio}>
          <View style={styles.container}>
            <Text style={styles.text}>RP: {rp} - NACIMIENTO: {nacim}</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
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
  containerChanged: {
    backgroundColor: '#4db150', // Fondo blanco para los elementos
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
  textChanged: {
    fontSize: 16,
    color: '#ffff'
  },
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ListItem({ data, funcion }) {
  const { nombre } = data;

  return (
    <TouchableOpacity onPress={funcion}>
      <View style={styles.container}>
        <Text style={styles.text}>{nombre}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e8ee',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,  // Bordes redondeados para un diseño más moderno
    marginVertical: 8,  // Espacio entre los elementos de la lista
    shadowColor: '#000',  // Sombra para dar efecto de elevación
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Elevación en Android
  },
  text: {
    fontSize: 16,
    color: '#070037',
    fontWeight: 'bold',  // Texto más destacado
  },
});

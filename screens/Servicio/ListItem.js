import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';

export default function ListItem({ data, registrarServicio }) {
  const { rp, nservicio, diasServicio, categoria, estpro, estrep } = data;

  // Usar useMemo para calcular siglas
  const siglas = useMemo(() => {
    const c = categoria === 'Vaca' ? 'VC' : 'VQ';
    const p = estpro === 'seca' ? 'S' : 'O';
    const r = estrep === 'vacia' ? 'V' : 'P';

    return { cat: c, prod: p, rep: r };
  }, [categoria, estpro, estrep]);

  return (
    <TouchableHighlight
      onPress={registrarServicio}
      underlayColor="#e1e8ee"
      accessible={true}
      accessibilityLabel={`Registro: ${rp}, Servicio: ${nservicio}, Días de Servicio: ${diasServicio}`}
    >
      <View style={styles.item}>
        <Text style={styles.itemText}>
          RP: {rp} - N° SERV.: {nservicio} - DIAS SERV.: {diasServicio}
        </Text>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});

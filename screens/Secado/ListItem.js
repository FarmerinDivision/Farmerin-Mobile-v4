import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ListItem({ data, animales, guardarAnimales }) {
  const { id, rp, estrep, diasPre, secar, categoria, estpro } = data;
  const [siglas, guardarSiglas] = useState({ cat: 'VC', prod: 'S', rep: 'V' });

  useEffect(() => {
    const c = categoria !== 'Vaca' ? 'VQ' : 'VC';
    const p = estpro !== 'seca' ? 'O' : 'S';
    const r = estrep !== 'vacia' ? 'P' : 'V';

    guardarSiglas({ cat: c, prod: p, rep: r });
  }, [categoria, estpro, estrep]);

  const toggleSecado = () => {
    const nuevosAnimales = animales.map(a =>
      a.id === id ? { ...a, secar: !a.secar } : a
    );

    guardarAnimales(nuevosAnimales);
  };

  return (
    <TouchableOpacity
      style={secar ? styles.containerSecar : styles.container}
      onPress={toggleSecado}
    >
      <Text style={secar ? styles.textSecar : styles.text}>
        {secar ? `SECAR - RP: ${rp}` : `RP: ${rp} (${siglas.cat}/${siglas.prod}/${siglas.rep}) - DIAS PREÑEZ: ${diasPre}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  containerSecar: {
    backgroundColor: '#4db150',
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
  text: {
    fontSize: 16,
    color: '#333',
  },
  textSecar: {
    fontSize: 16,
    color: '#FFF',
  },
});

import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ListItem({ data, guardarAnimales, animales }) {
  const { rp, estrep, estpro, categoria, diasPre, celar, id } = data;
  const [siglas, guardarSiglas] = useState({
    cat: 'VC',
    prod: 'S',
    rep: 'V',
  });

  useEffect(() => {
    let c = 'VC';
    let p = 'S';
    let r = 'V';

    if (categoria !== 'Vaca') c = 'VQ';
    if (estpro !== 'seca') p = 'O';
    if (estrep !== 'vacia') r = 'P';

    guardarSiglas({
      cat: c,
      prod: p,
      rep: r,
    });
  }, [categoria, estpro, estrep]);

  function cancelCelo() {
    if (celar) {
      const animalesAct = animales.map((a) => {
        if (a.id === id) {
          a.celar = false;
        }
        return a;
      });
      guardarAnimales(animalesAct);
    }
  }

  function celo() {
    if (!celar) {
      const animalesAct = animales.map((a) => {
        if (a.id === id) {
          a.celar = true;
        }
        return a;
      });
      guardarAnimales(animalesAct);
    }
  }

  return (
    <>
      {celar ? (
        <TouchableOpacity onPress={cancelCelo} style={styles.containerCelo}>
          <Text style={styles.text2}>
            RP: {rp} ({siglas.cat}/{siglas.prod}/{siglas.rep}) - DIAS PREÑEZ: {diasPre}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.container} onPress={celo}>
          <Text style={styles.text}>
            RP: {rp} ({siglas.cat}/{siglas.prod}/{siglas.rep}) - DIAS PREÑEZ: {diasPre}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10, // Espacio entre elementos
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  containerCelo: {
    backgroundColor: '#4db150',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10, // Espacio entre elementos
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
  text2: {
    fontSize: 16,
    color: '#ffffff',
  },
});

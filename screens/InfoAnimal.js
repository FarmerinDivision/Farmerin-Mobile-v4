import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function InfoAnimal({ animal, datos }) {
  const { rp, estpro, estrep, categoria, diasPre, nservicio, diasServicio, erp } = animal;
  const [siglas, guardarSiglas] = useState({
    cat: 'VC',
    prod: 'S',
    rep: 'V'
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
      rep: r
    });
  }, [categoria, estpro, estrep]);

  return (
    <View style={styles.container}>
      {datos === 'erp' ? (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>RP:</Text>
            <Text style={styles.value}>{rp}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>eRP:</Text>
            <Text style={styles.value}>{erp}</Text>
          </View>
        </>
      ) : datos === 'servicio' ? (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>RP:</Text>
            <Text style={styles.value}>{rp} - {siglas.cat}/{siglas.prod}/{siglas.rep}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>DIAS ULT. SERV:</Text>
            <Text style={styles.value}>{diasServicio} - N° SERV: {nservicio}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.label}>RP:</Text>
            <Text style={styles.value}>{rp} - {siglas.cat}/{siglas.prod}/{siglas.rep}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>DIAS PREÑ:</Text>
            <Text style={styles.value}>{diasPre}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#297fb8', // Cambiado a un color más moderno
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginRight: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
  },
});

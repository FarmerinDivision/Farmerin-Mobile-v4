import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

export default function ListItem({ data, registrarParto, registrarAborto }) {
  const [alerta, setAlerta] = useState(false);
  const { rp, fservicio, estrep, estpro, diasPre, categoria } = data;
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
  }, []);

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => setAlerta(true)}>
        <Text style={styles.text}>
          RP: {rp} ({siglas.cat}/{siglas.prod}/{siglas.rep}) - DIAS PREÑEZ: {diasPre}
        </Text>
      </TouchableOpacity>

      <Modal
        isVisible={alerta}
        onBackdropPress={() => setAlerta(false)}
        onBackButtonPress={() => setAlerta(false)}
      >
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>¿QUÉ DESEA REGISTRAR?</Text>
          <View style={styles.alertActions}>
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: '#DD6B55' }]}
              onPress={() => {
                setAlerta(false);
                registrarAborto();
              }}
            >
              <Text style={styles.buttonText}>ABORTO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: '#3AD577' }]}
              onPress={() => {
                setAlerta(false);
                registrarParto();
              }}
            >
              <Text style={styles.buttonText}>PARTO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  text: {
    fontSize: 16,
    color: '#333',
  },
  alertContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

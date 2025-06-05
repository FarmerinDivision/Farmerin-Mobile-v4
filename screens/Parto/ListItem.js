import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

export default function ListItem({ data, registrarParto, registrarAborto }) {
  const [alerta, setAlerta] = useState(false);
  const { id, rp, fservicio, estrep, estpro, diasPre, categoria } = data;
  const [parto, setParto] = useState(false);
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

  const confirmar = () => {
    setAlerta(true);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={confirmar}>
        <Text style={styles.text}>
          RP: {rp} ({siglas.cat}/{siglas.prod}/{siglas.rep}) - DIAS PREÑEZ: {diasPre}
        </Text>
      </TouchableOpacity>

      <AwesomeAlert
        show={alerta}
        showProgress={false}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={true}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="ABORTO"
        confirmText="PARTO"
        onDismiss={() => setAlerta(false)}
        cancelButtonTextStyle={styles.buttonText}
        confirmButtonTextStyle={styles.buttonText}
        confirmButtonColor="#3AD577"
        cancelButtonColor="#DD6B55"
        contentContainerStyle={styles.alertContentContainer}
        contentStyle={styles.alertContent}
        actionContainerStyle={styles.alertActions} // Aquí está el cambio
        cancelButtonStyle={styles.cancelButton}
        confirmButtonStyle={styles.confirmButton}
        onCancelPressed={() => {
          setAlerta(false);
          registrarAborto();
        }}
        onConfirmPressed={() => {
          setAlerta(false);
          registrarParto();
        }}
      />
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
  text: {
    fontSize: 16,
    color: '#333', // Color oscuro para el texto
  },
  buttonText: {
    fontSize: 40,
    fontWeight: 'lighter',
    textAlign: 'center',
    color: '#fff',
  },
  alertContentContainer: {
    width: 400,
    height: 450,
    borderRadius: 15,
    overflow: 'hidden',
  },
  alertContent: {
    padding: 5,
  },
  alertActions: {
    flexDirection: 'column-reverse', // Cambio aquí para que el botón de PARTO quede arriba
    alignItems: 'center',
    padding: 5,
  },
  cancelButton: {
    backgroundColor: '#e12400',
    width: 500,
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  },
  confirmButton: {
    backgroundColor: '#4db150',
    width: 500,
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

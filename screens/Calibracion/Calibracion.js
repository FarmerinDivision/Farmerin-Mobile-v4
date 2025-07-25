import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { encode } from 'base-64';
import { isNaN } from 'formik';
import Modal from 'react-native-modal';
import { useRoute } from '@react-navigation/core';

export default ({ navigation }) => {

  const route = useRoute();
  const { tambo } = route.params;
  const { id, host } = tambo;

  const [relAct, setRelAct] = useState(0);
  const [racion, setRacion] = useState(2);
  const [promedio, setPromedio] = useState(0);
  const [relacion, setRelacion] = useState(0);
  const [acumulado, setAcumulado] = useState(0);
  const [peso, setPeso] = useState("");
  const [mediciones, setMediciones] = useState(0);
  const [iniciar, setIniciar] = useState(true);
  const [alerta, setAlerta] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    color: '#DD6B55'
  });

  useEffect(() => {
    if (!global.btoa) {
      global.btoa = encode;
    }
    setIniciar(true);
    setMediciones(0);
    obtenerRelacion();
    obtenerRacion();
  }, []);

  const handleSubmit = () => {
    let m = mediciones;
    let p = parseInt(peso);
    if (isNaN(p)) {
      setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'INGRESE UN NUMERO', color: '#DD6B55' });
    } else {
      if (p > 0) {
        if (m < 5) {
          m++;
          let acum = acumulado + p;
          let prom = acum / m;
          let rel = (prom * relAct) / (racion * 1000);
          setMediciones(m);
          setAcumulado(acum);
          setPromedio(prom);
          setRelacion(rel);
          setPeso("");
        }
      } else {
        setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'EL PESO DEBE SER MAYOR A CERO', color: '#DD6B55' });
      }
    }
  };

  async function obtenerRelacion() {
    const url = 'http://' + host + '/relacion';
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const r = await api.json();
      const rel = r[0].relacion;
      setRelAct(isNaN(parseFloat(rel)) ? 0 : parseFloat(rel));
    } catch (error) {
      setRelAct(0);
      setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'NO SE PUEDE CONECTAR AL TAMBO ' + error, color: '#DD6B55' });
    }
  }

  async function obtenerRacion() {
    const url = 'http://' + host + '/racion';
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const r = await api.json();
      const rac = r[0].racion;
      setRacion(isNaN(parseFloat(rac)) ? 2 : parseFloat(rac));
    } catch (error) {
      setRacion(2);
      setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'NO SE PUEDE OBTENER RACIÓN DE CALIBRACION ' + error, color: '#DD6B55' });
    }
  }

  async function moverMotor() {
    const url = 'http://' + host + '/moverMotor/1&1&' + racion;
    const login = 'farmerin';
    const password = 'Farmerin*2021';
    try {
      const api = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${login}:${password}`),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      const t = await api.json();
      setAlerta({ show: true, titulo: '¡ATENCION!', mensaje: t[0].mensaje, color: '#3AD577' });
    } catch (error) {
      setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'NO SE PUEDE CONECTAR AL TAMBO', color: '#DD6B55' });
    }
  }

  async function finalizar() {
    if (relacion > 0) {
      const url = 'http://' + host + '/setRelacion/' + relacion;
      const login = 'farmerin';
      const password = 'Farmerin*2021';
      try {
        const api = await fetch(url, {
          headers: {
            'Authorization': 'Basic ' + btoa(`${login}:${password}`),
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
        const t = await api.json();
        setAlerta({ show: true, titulo: '¡ATENCION!', mensaje: t[0].mensaje, color: '#3AD577' });
        setRelAct(relacion);
      } catch (error) {
        setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'NO SE PUDO MODIFICAR LA RELACIÓN', color: '#DD6B55' });
      }
      setMediciones(0);
      setRelacion(0);
      setAcumulado(0);
      setPromedio(0);
      setPeso("0");
      setIniciar(true);
    } else {
      setAlerta({ show: true, titulo: '¡ ERROR !', mensaje: 'LA RELACIÓN DEBE SER MAYOR A CERO', color: '#DD6B55' });
    }
  }

  return (
    <View style={styles.container}>
      {relAct === 0 ? (
        <Text style={styles.alerta}>NO SE PUEDE OBTENER LA RELACION PASO/GRAMOS ACTUAL</Text>
      ) : (
        <ScrollView>
          <Text style={styles.texto}>1 - PRESIONE "INICIAR"</Text>
          <Text style={styles.texto}>2 - DESCARGUE MOTOR 1 PARA PESAR</Text>
          <Text style={styles.texto}>3 - INTRODUZCA LOS GRAMOS PESADOS Y PRESIONE "+"</Text>
          <Text style={styles.texto}>4 - REPETIR DESDE EL PUNTO 2 TANTAS VECES COMO VEA NECESARIO (SE TOMAN SOLO 5 MUESTRAS).</Text>
          <Text style={styles.texto}>5 - PRESIONE FINALIZAR</Text>
          <Text style={styles.textoA}>¡ATENCION!</Text>
          <Text style={styles.textoB}>SE HARÁ LA DESCARGA EN MOTOR 1 - LADO IZQUIERDO</Text>

          {iniciar ? (
            <Button
              style={styles.boton}
              title="INICIAR"
              icon={<Icon name="play-circle" size={35} color="#FCFAFA" />}
              onPress={() => setIniciar(false)}
            />
          ) : (
            <>
              <View style={styles.form}>
                <Button
                  style={styles.boton}
                  title="DESCARGA MOTOR 1"
                  icon={<Icon name="refresh" size={35} color="#FCFAFA" />}
                  onPress={moverMotor}
                />
                <View style={styles.peso}>
                  <TextInput
                    placeholder="INGRESE LOS GRAMOS MEDIDOS"
                    style={styles.entrada}
                    onChangeText={(t) => setPeso(t)}
                    value={peso}
                    keyboardType="numeric"
                  />
                  <Button
                    style={styles.boton}
                    title=""
                    icon={<Icon name="plus-square" size={35} color="#FCFAFA" />}
                    onPress={handleSubmit}
                  />
                </View>
                <Text style={styles.texto}>MEDICIONES: {mediciones}</Text>
                <Text style={styles.texto}>PROMEDIO: {promedio}</Text>
                <Text style={styles.texto}>NUEVA RELACION GR/P: {relacion}</Text>
                <Text style={styles.texto}>RELACION ACTUAL GR/P: {relAct}</Text>
              </View>
              <Button
                style={styles.boton}
                title="FINALIZAR"
                icon={<Icon name="check-square" size={35} color="#FCFAFA" />}
                onPress={finalizar}
              />
            </>
          )}
        </ScrollView>
      )}

      <Modal
        isVisible={alerta.show}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver
        hideModalContentWhileAnimating
        onBackdropPress={() => {}}
        onBackButtonPress={() => {}}
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: alerta.color, textAlign: 'center' }}>{alerta.titulo}</Text>
          <Text style={{ marginVertical: 15, fontSize: 16, textAlign: 'center' }}>{alerta.mensaje}</Text>
          <Button
            title="ACEPTAR"
            onPress={() => setAlerta({ show: false })}
            buttonStyle={{ backgroundColor: alerta.color, borderRadius: 8 }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f2f4f8',
  },
  form: {
    paddingVertical: 10,
    backgroundColor: '#e1e8ee',
    borderRadius: 8,
    marginVertical: 10,
  },
  texto: {
    marginVertical: 5,
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: '#002742',
  },
  textoA: {
    marginVertical: 10,
    fontSize: 17,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: '#FF0000',
  },
  textoB: {
    fontSize: 14,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: '#002742',
  },
  entrada: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  boton: {
    margin: 5,
    paddingVertical: 10,
    backgroundColor: '#297fb8',
    borderRadius: 8,
  },
  peso: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import firebase from '../database/firebase';
import { useFormik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons'; // Asegúrate de tener esta importación

const CustomPasswordInput = ({ onChangeText, value }) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.passwordContainer}>
      <TextInput
        style={styles.passwordInput}
        secureTextEntry={!isPasswordVisible}
        onChangeText={onChangeText}
        value={value}
        placeholder="Contraseña"
        placeholderTextColor="gray"
      />
      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
        <Ionicons 
          name={isPasswordVisible ? 'eye-off' : 'eye'} 
          size={20} 
          color="gray" 
        />
      </TouchableOpacity>
    </View>
  );
};

export default ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState('');

  const validate = values => {
    const errors = {};
    if (!values.usuario) {
      errors.usuario = "DEBE INGRESAR UN CORREO ELECTRONICO";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.usuario)) {
      errors.usuario = 'Formato incorrecto';
    }
    if (!values.nombre) {
      errors.nombre = "DEBE INGRESAR UN NOMBRE";
    }
    if (!values.clave) {
      errors.clave = "DEBE INGRESAR UNA CONTRASEÑA";
    }
    return errors;
  };

  const formLogin = useFormik({
    initialValues: {
      nombre: '',
      usuario: '',
      clave: '',
    },
    validate,
    onSubmit: datos => Registrar(datos)
  });

  async function guardarUsuario(usuario, nombreUsuario) {
    try {
      await AsyncStorage.setItem('usuario', usuario);
      await AsyncStorage.setItem('nombre', nombreUsuario);
      navigation.navigate('CONFIGURACION');
    } catch (error) {
      setAlerta(error.message);
    }
  }

  async function Registrar(datos) {
    setLoading(true);
    const { usuario: email, clave: password, nombre } = datos;

    try {
      const res = await firebase.autenticacion.createUserWithEmailAndPassword(email, password);
      await res.user.updateProfile({ displayName: nombre });
      await guardarUsuario(res.user.uid, nombre); // Llama a guardarUsuario aquí si es necesario
      navigation.reset('MenuEventos');
    } catch (error) {
      setAlerta(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color='#1b829b' />
      ) : (
        <View style={styles.form}>
          <Image
            style={styles.logo}
            source={require('../assets/logolargo2.png')}
          />
          <TextInput
            style={styles.input}
            placeholder='Nombre Completo'
            onChangeText={formLogin.handleChange('nombre')}
            value={formLogin.values.nombre}
            placeholderTextColor='gray'
          />
          {formLogin.errors.nombre && <Text style={styles.errorText}>{formLogin.errors.nombre}</Text>}

          <TextInput
            style={styles.input}
            placeholder='Correo Electrónico'
            onChangeText={formLogin.handleChange('usuario')}
            value={formLogin.values.usuario}
            placeholderTextColor='gray'
          />
          {formLogin.errors.usuario && <Text style={styles.errorText}>{formLogin.errors.usuario}</Text>}

          <CustomPasswordInput
            onChangeText={formLogin.handleChange('clave')}
            value={formLogin.values.clave}
          />
          {formLogin.errors.clave && <Text style={styles.errorText}>{formLogin.errors.clave}</Text>}

          <Button
            title="REGISTRARSE"
            onPress={formLogin.handleSubmit}
            buttonStyle={styles.button}
          />
        </View>
      )}
      {alerta && (
        <Modal
          isVisible={!!alerta}
          onBackdropPress={() => setAlerta('')}
          onBackButtonPress={() => setAlerta('')}
        >
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>¡ATENCIÓN!</Text>
            <Text style={{ marginVertical: 10 }}>{typeof alerta === 'object' ? alerta.mensaje : alerta}</Text>
            <Button
              title="ACEPTAR"
              onPress={() => setAlerta('')}
              buttonStyle={{ backgroundColor: '#DD6B55', marginTop: 10 }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: '60%',
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#212121',
    marginBottom: 15,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4cb050',
    borderRadius: 8,
    height: 50,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#212121',
  },
  eyeIcon: {
    padding: 10,
  },
});

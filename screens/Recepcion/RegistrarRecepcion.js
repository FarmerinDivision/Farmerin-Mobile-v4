import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import firebase from '../../database/firebase';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function RegistrarRecepcion() {
  const route = useRoute();
  const navigation = useNavigation();
  const { usuario } = route.params;
  const { tambo } = route.params;

  const [permisos, setPermisos] = useState(null);
  const [show, setShow] = useState(false);
  const [foto, setFoto] = useState(null);
  const camRef = useRef(null);

  const [tipo, setTipo] = useState('Racion');
  const [openTipo, setOpenTipo] = useState(false);
  const [itemsTipo, setItemsTipo] = useState([
    { label: 'RACION', value: 'Racion' },
    { label: 'ART. LIMPIEZA', value: 'Art. Limpieza' },
    { label: 'ART. VETERINARIA', value: 'Art. Veterinaria' },
    { label: 'SEMEN', value: 'Semen' },
  ]);

  const [detalle, setDetalle] = useState('');

  // Debug para verificar si llegan los datos
  console.log('📦 route.params:', route.params);
  console.log('🐄 tambo:', tambo);
  console.log('👤 usuario:', usuario);

  // Verificación de datos obligatorios
  if (!tambo || !usuario) {
    return (
      <View style={styles.centeredView}>
        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>
          ❌ FALTAN DATOS DE USUARIO O TAMBO
        </Text>
      </View>
    );
  }

  /*  useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermisos(status === 'granted');
      })();
    }, []);
  
    const tomarFoto = async () => {
      if (camRef.current) {
        try {
          const photo = await camRef.current.takePictureAsync({ quality: 0.7 });
          setFoto(photo.uri);
          setShow(false);
        } catch (error) {
          console.log("Error al tomar la foto:", error);
        }
      }
    };
  */
  const guardar = async () => {
    if (!detalle.trim()) {
      Alert.alert("Campo obligatorio", "Debe completar el detalle.");
      return;
    }

    const fecha = new Date();
    const nuevaRecepcion = {
      detalle,
      tipo,
      usuario: usuario.email,
      fecha,
    };

    try {
      const docRef = await firebase.db
        .collection('tambo')
        .doc(tambo.id)
        .collection('recepcion')
        .add(nuevaRecepcion);

      if (foto) {
        const nombreFoto = `${docRef.id}.jpg`;
        const response = await fetch(foto);
        const blob = await response.blob();
        const ref = firebase.almacenamiento
          .ref()
          .child(`${tambo.id}/recepciones/${nombreFoto}`);
        await ref.put(blob);
        await docRef.update({ foto: nombreFoto });
      }

      navigation.goBack();
    } catch (error) {
      console.log("Error al guardar recepción:", error);
      Alert.alert("Error", "No se pudo guardar la recepción.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>TIPO:</Text>
      <DropDownPicker
        open={openTipo}
        value={tipo}
        items={itemsTipo}
        setOpen={setOpenTipo}
        setValue={setTipo}
        setItems={setItemsTipo}
        placeholder="Seleccionar tipo"
        style={styles.dropdown}
        dropDownContainerStyle={{ zIndex: 1000 }}
      />

      <Text style={styles.label}>DETALLE:</Text>
      <TextInput
        style={styles.input}
        placeholder="Escriba el detalle"
        value={detalle}
        onChangeText={setDetalle}
        multiline
      />

      <Text style={styles.label}>FOTO:</Text>
      {foto ? (
        <Image source={{ uri: foto }} style={styles.foto} />
      ) : (
        <Text style={styles.placeholder}>No se ha tomado una foto</Text>
      )}

      <Button
        title="TOMAR FOTO"
        icon={<Icon name="camera" size={25} color="#fff" />}
        buttonStyle={styles.boton}
        onPress={() => {
          if (permisos) {
            setShow(true);
          } else {
            Alert.alert("Permiso denegado", "No se puede acceder a la cámara.");
          }
        }}
      />

      <Button
        title="GUARDAR RECEPCIÓN"
        icon={<Icon name="save" size={25} color="#fff" />}
        buttonStyle={[styles.boton, { backgroundColor: '#28a745' }]}
        onPress={guardar}
      />

      {/* Modal de Cámara 
      <Modal visible={show} animationType="slide">
        <View style={styles.modalCamara}>
          <Camera style={styles.camara} type={Camera.Constants.Type.back} ref={camRef} />
          <View style={styles.botoneraCamara}>
            <TouchableOpacity style={styles.botonCamara} onPress={() => setShow(false)}>
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonCamara} onPress={tomarFoto}>
              <Text style={styles.botonTexto}>Tomar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    minHeight: 60,
  },
  foto: {
    width: '100%',
    height: 250,
    marginVertical: 10,
    borderRadius: 6,
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#888',
    marginVertical: 10,
  },
  boton: {
    backgroundColor: '#007bff',
    marginTop: 15,
    borderRadius: 6,
    paddingVertical: 12,
  },
  modalCamara: {
    flex: 1,
    backgroundColor: '#000',
  },
  camara: {
    flex: 1,
  },
  botoneraCamara: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#111',
  },
  botonCamara: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  botonTexto: {
    fontWeight: 'bold',
  },
  dropdown: {
    marginTop: 5,
    marginBottom: 15,
    borderColor: '#ccc',
  },
});

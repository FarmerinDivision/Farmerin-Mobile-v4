import React,{useEffect,useState} from 'react';
import { View, Text, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';
export default function ListItem({ data, eliminarRecepcion}) {
  const [alerta, setAlerta] = useState(false);

  const { id, fecha,tipo } = data;
  const [fechaRecep,setFecharRecep]=useState('');

  useEffect(() => {
    const f = new Date(fecha.toDate());
    const ff=format(f, 'dd/MM/yy')
    setFecharRecep(ff);
    
  }, []);
 

const confirmar = ()=>{
  setAlerta(true)
}
  return (
    <View style={styles.container}>
    <View style={styles.contentContainer}>
      <Text style={styles.text}>FECHA: {fechaRecep} - {tipo}</Text>
      <Button
        style={styles.botonBorrar}
        type="clear"
        icon={
          <Icon
            name="trash"
            size={35}
            color="#B00202"
            onPress={confirmar}
          />
        }
      />
    </View>
    <Modal
      visible={alerta}
      transparent
      animationType="fade"
      onRequestClose={() => setAlerta(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>¡ATENCIÓN!</Text>
          <Text style={styles.modalMessage}>¿DESEA ELIMINAR ESTA RECEPCIÓN?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#DD6B55', flex: 1, marginRight: 5 }]}
              onPress={() => setAlerta(false)}
            >
              <Text style={styles.modalButtonText}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#3AD577', flex: 1, marginLeft: 5 }]}
              onPress={() => {
                setAlerta(false);
                eliminarRecepcion();
              }}
            >
              <Text style={styles.modalButtonText}>ACEPTAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
  )
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
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  botonBorrar: {
    margin: 0,
    padding: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    minWidth: 250,
    elevation: 5,
    width: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
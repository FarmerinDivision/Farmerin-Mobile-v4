import React,{useEffect,useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'
import { Button } from 'react-native-elements';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ListItem({ data, eliminarProduccion, info }) {

  const { id, fecha,produccion } = data;
  const [fechaProd,setFechaProd]=useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const f = new Date(fecha.toDate());
    const ff=format(f, 'dd/MM/yy')
    setFechaProd(ff);

  }, []);
 

  const confirmar = () => {
    setShowConfirm(true);
  }
  return (
    <>
    <TouchableOpacity onPress={info} style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>FECHA: {fechaProd} - LTS: {produccion}</Text>
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
    </TouchableOpacity>

    {showConfirm && (
      <Modal
        isVisible={showConfirm}
        onBackdropPress={() => setShowConfirm(false)}
        onBackButtonPress={() => setShowConfirm(false)}
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>¡ATENCIÓN!</Text>
          <Text style={{ marginVertical: 10 }}>¿Desea eliminar esta producción?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              title="CANCELAR"
              type="clear"
              onPress={() => setShowConfirm(false)}
            />
            <Button
              title="ELIMINAR"
              onPress={() => { setShowConfirm(false); eliminarProduccion(); }}
              buttonStyle={{ backgroundColor: '#DD6B55', marginTop: 10, marginLeft: 10 }}
            />
          </View>
        </View>
      </Modal>
    )}
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
});
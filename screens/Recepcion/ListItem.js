import React,{useEffect,useState} from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { format } from 'date-fns'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';
import AwesomeAlert from 'react-native-awesome-alerts';
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
    <AwesomeAlert
      show={alerta}
      showProgress={false}
      title="¡ATENCIÓN!"
      message="¿DESEA ELIMINAR ESTA RECEPCIÓN?"
      closeOnTouchOutside={false}
      closeOnHardwareBackPress={false}
      showCancelButton={true}
      showConfirmButton={true}
      cancelText="CANCELAR"
      confirmText="ACEPTAR"
      confirmButtonColor="#3AD577"
      cancelButtonColor="#DD6B55"
      onCancelPressed={() => {
        setAlerta(false);
      }}
      onConfirmPressed={() => {
        setAlerta(false);
        eliminarRecepcion();
      }}
    />
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
});
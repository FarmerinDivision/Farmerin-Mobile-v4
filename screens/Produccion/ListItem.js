import React,{useEffect,useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'
import { Button } from 'react-native-elements';
import AwesomeAlert from 'react-native-awesome-alerts';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ListItem({ data,eliminarProduccion, info}) {

  const { id, fecha,produccion } = data;
  const [fechaProd,setFechaProd]=useState('');
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    const f = new Date(fecha.toDate());
    const ff=format(f, 'dd/MM/yy')
    setFechaProd(ff);

  }, []);
 

  const confirmar = ()=>{
    setAlerta(true)
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

    <AwesomeAlert
      show={alerta}
      showProgress={false}
      title="¡ATENCIÓN!"
      message="¿DESEA ELIMINAR ESTA PRODUCCIÓN?"
      closeOnTouchOutside={false}
      closeOnHardwareBackPress={false}
      showCancelButton={true}
      showConfirmButton={true}
      cancelText="CANCELAR"
      confirmText="ACEPTAR"
      confirmButtonColor="#3AD577"
      cancelButtonColor="#DD6B55"
      onCancelPressed={() => setAlerta(false)}
      onConfirmPressed={() => {
        setAlerta(false);
        eliminarProduccion();
      }}
    />
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
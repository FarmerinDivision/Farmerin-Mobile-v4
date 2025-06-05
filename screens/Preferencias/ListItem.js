import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { getAuth, deleteUser } from "firebase/auth";
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListItem({ data, navigation }) {
  const [alerta, setAlerta] = useState(false)
  const auth = getAuth();
  const user = auth.currentUser;
  const { title } = data;
  const deletex = () => {
    deleteUser(user).then(() => {
      // User deleted.
    }).catch((error) => {
      console.log(error)
    });
  }
  const cartel = () => {
    setAlerta(true);
  }


  return (
    <>
      {data.red ?
        <TouchableHighlight onPress={cartel}
        >
          <View style={styles.container}>
            <View style={styles.row}>
              <Text style={styles.text}>{title}</Text>
            </View>
          </View>
        </TouchableHighlight>

        :
        null
      }
      {data.isAdmin == true ?
                <TouchableHighlight onPress={()=>navigation.push(data.navegar)}
                >
                  <View style={styles.container2}>
                    <View style={styles.row}>
                      <Text style={styles.text}>{title}</Text>
                    </View>
                  </View>
                </TouchableHighlight> : 
                null
      }
      <AwesomeAlert
        show={alerta}
        showProgress={false}
        title="¡ATENCION!"
        message="¿DESEA ELIMINAR LA CUENTA?"
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="CANCELAR"
        confirmText="ACEPTAR"
        titleStyle={{ color: "red", fontSize: 26 }}
        messageStyle={{ fontWeight: "bold", fontSize: 18 }}
        cancelButtonStyle={{ width: 120 }}
        confirmButtonStyle={{ width: 120 }}
        cancelButtonTextStyle={{ textAlign: "center", fontSize: 16 }}
        confirmButtonTextStyle={{ textAlign: "center", fontSize: 16 }}
        confirmButtonColor="#DD6B55"
        cancelButtonColor='#c4c4c4'
        onCancelPressed={() => {
          setAlerta(false)
        }}
        onConfirmPressed={() => {
          setAlerta(false)
          deletex()
          AsyncStorage.removeItem('usuario');
          AsyncStorage.removeItem('nombre');
          navigation.navigate('OnBoarding');

        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  container2: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 20,
    color: 'white',
    paddingTop: 3,
    fontWeight: "bold"
  },

  logo: {
    marginRight: 35,
    width: 33,
    height: 33,
    marginLeft: 13
  },
  row: {
    flexDirection: "row"
  },

});
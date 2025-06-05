import React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import ListSesiones from "./ListSesiones";
import firebase from '../../database/firebase';
import { Input } from "react-native-elements";
import { TouchableHighlight } from "react-native-gesture-handler";
import axios from 'axios';
import AwesomeAlert from 'react-native-awesome-alerts';



export default ({ navigation }) => {
    const [titulo, setTitulo] = useState("")
    const [texto, setTexto] = useState("")
    const [alerta, setAlerta]= useState(false)

    function sendN () {
        axios.post(`https://app.nativenotify.com/api/notification`, {
            appId: 4382,
            appToken: "XSlDDRiRyq1qAZLssswMTu",
            title: titulo,
            body: texto,
        });
    }
    function handleTitulo(e) {
        setTitulo(e)
    }

    function handleTexto(e) {
        setTexto(e)
    }

    function Aviso () {
        setAlerta(true)
    }

    return (
        <View style={styles.container}>
            <View style={{marginBottom:20, width:"100%", display:"flex",justifyContent:"center",alignItems:"center"}}>
            <Text style={{fontSize:20, fontWeight:"bold", color:"#505050"}}>TITULO</Text>
            <Input onChangeText={handleTitulo}></Input>
            </View>
            <View style={{marginBottom:20, width:"100%", display:"flex",justifyContent:"center",alignItems:"center"}}>
            <Text style={{fontSize:20, fontWeight:"bold", color:"#505050"}}>TEXTO</Text>
            <Input onChangeText={handleTexto}></Input>
            </View>
            <TouchableHighlight onPress={Aviso}>
            <View style={styles.boton}>
                <Text style={{fontSize:25,fontWeight:"bold",color:"white"}}>
                    ENVIAR NOTIFICACION
                </Text>
            </View>
            </TouchableHighlight>
            <AwesomeAlert
        show={alerta}
        showProgress={false}
        title="¡ATENCION!"
        message="¿ENVIAR ALERTA?"
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
        confirmButtonColor="green"
        cancelButtonColor='#c4c4c4'
        onCancelPressed={() => {
          setAlerta(false)
        }}
        onConfirmPressed={() => {
          setAlerta(false)
            sendN()
        }}
      />
        </View>
        
    );
};
const styles = StyleSheet.create({
    container: {
        display: "flex",
        backgroundColor: "white",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column",
        height:"100%",
        width:"100%"
    },
    boton: {
        backgroundColor:"green",
        width:"100%",
        height: 50,
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        paddingVertical:8,
        paddingHorizontal:15,
        borderRadius:6
    },
    linea: {
        height: 1,
        backgroundColor: '#2980B9',
        marginVertical: 25
    },
    titulo: {
        marginVertical: 15,
        marginLeft: 23
    },
    textocon: {
        fontSize: 18,
        color: '#505050',
    }
});

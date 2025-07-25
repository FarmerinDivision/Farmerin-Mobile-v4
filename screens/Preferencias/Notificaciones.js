import React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import ListSesiones from "./ListSesiones";
import firebase from '../../database/firebase';
import { Input } from "react-native-elements";
import { TouchableHighlight } from "react-native-gesture-handler";
import axios from 'axios';
import Modal from 'react-native-modal';


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
            {alerta && (
  <Modal
    isVisible={!!alerta}
    onBackdropPress={() => setAlerta(false)}
    onBackButtonPress={() => setAlerta(false)}
  >
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'red' }}>¡ATENCIÓN!</Text>
      <Text style={{ marginVertical: 10 }}>¿DESEA ELIMINAR LA CUENTA?</Text>
      <Button
        title="ACEPTAR"
        onPress={() => setAlerta(false)}
        buttonStyle={{ backgroundColor: '#DD6B55', marginTop: 10 }}
      />
      <Button
        title="CANCELAR"
        onPress={() => setAlerta(false)}
        buttonStyle={{ backgroundColor: '#c4c4c4', marginTop: 10 }}
      />
    </View>
  </Modal>
)}
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

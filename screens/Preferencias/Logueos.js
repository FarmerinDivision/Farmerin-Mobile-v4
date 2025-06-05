import React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Text } from "react-native";
import ListSesiones from "./ListSesiones";
import firebase from '../../database/firebase';


export default ({ navigation }) => {
    const [sesiones, setSesiones] = useState([])
    useEffect(() => {
        obtener()
    }, []);

    function obtener() {
        try {
            firebase.db.collection('tambo').doc('pE4hwq7QszCJrxnYYaIV').get().then(snapshot)
        } catch (error) {
            console.log(error)
        }
    }

    function snapshot(snapshot) {
        setSesiones(snapshot.data().sesiones);
    }

    const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#2980B9' }}></View>

    return (
        <View style={styles.container}>
            <View style={styles.listado}>
                <FlatList
                    ItemSeparatorComponent={() => <Separator />}
                    data={sesiones}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={100}
                    renderItem={({ item }) => (
                        <ListSesiones data={item} navigation={navigation}
                        />
                    )}
                />
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e1e8ee",
    },
    linea: {
        height: 1,
        backgroundColor: '#070037',
        marginVertical: 25
    },
    listado: {
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

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text } from "react-native";
import ListItem from "./ListItem";
import { useRoute } from '@react-navigation/core';
 
export default ({ navigation }) => {

  const route = useRoute();
  const {tambo} = route.params;

  const [admin, setAdmin]=useState(false)
  const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#ffff' }}></View>

  useEffect(
    ()=>{
      if (tambo.id == "M324egnsekSUcxyzq9YD") {
        setAdmin(true);
      }
    }
,[]);

  const DATA = [
    {
      title: "ELIMINAR CUENTA",
      id: 0,
      red: true,
    },
    {
      title: "ENVIAR NOTIFICACIONES",
      id: 1, navegar: "Notificaciones",
      isAdmin: admin

    },
    {
      title: "INGRESOS EN TAMBO EXPO",
      id: 2, navegar: "Logueos",
      isAdmin: admin

    }
  ]
  return (
    <View style={styles.container}>
      <View style={styles.listado}>
        <FlatList
          ItemSeparatorComponent={() => <Separator />}
          data={DATA}
          keyExtractor={(item) => item.id}
          initialNumToRender={100}
          renderItem={({ item }) => (
            <ListItem data={item} navigation={navigation} />
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
    backgroundColor: '#2980B9',
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

import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import ListItem from './ListItem';
import { useRoute } from '@react-navigation/core';

const vaquillona = () => ({ navigation }) => {
  const route = useRoute();
  const { tambo } = route.params;

  const opciones = [
    { id: '0', nombre: 'REGISTRO DE CRIA', accion: 'RegistroCria' },
    { id: '1', nombre: 'REGISTRAR SERVICIO', accion: 'Servicio' },
    { id: '2', nombre: 'REGISTRAR TACTO', accion: 'Tacto' },
    { id: '3', nombre: 'REGISTRAR PARTO/ABORTO', accion: 'Parto' },
    { id: '4', nombre: 'REGISTRAR BAJA', accion: 'Baja' },
    { id: '5', nombre: 'REGISTRAR RECHAZO', accion: 'Rechazo' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={opciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            data={item}
            funcion={() => {
              navigation.push(item.accion, {
                tambo: tambo,
                estado: ['preparto'],
              });
            }}
          />
        )}
        ItemSeparatorComponent={() => <Separator />}
      />
    </View>
  );
};

const Separator = () => <View style={styles.separator}></View>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8', // Fondo más suave
    paddingHorizontal: 15, // Espaciado lateral
    paddingVertical: 10, // Espaciado vertical
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd', // Separador más sutil
    marginVertical: 5, // Margen entre cada elemento
  },
  alerta: {
    backgroundColor: '#FFBF5A',
    fontSize: 15,
    color: '#868584',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
});

vaquillona.navigationOptions = {
  title: 'Alta Vaquillonas',
};

export default vaquillona;

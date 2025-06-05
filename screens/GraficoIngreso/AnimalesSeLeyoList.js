// /components/lists/AnimalesSeLeyoList.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const AnimalesSeLeyoList = ({ animales }) => {
  return (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Se Leyeron</Text>
      <FlatList
        data={animales}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.RP || 'RP desconocido'}</Text>
            <Text style={styles.rowText}>{item.RFID?.replace(/⛔/g, '') || 'RFID desconocido'}</Text>
            <Text style={styles.rowText}>{item.DiasAusente}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginVertical: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rowText: {
    fontSize: 16,
  },
});

export default AnimalesSeLeyoList;

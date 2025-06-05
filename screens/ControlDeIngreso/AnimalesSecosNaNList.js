import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const AnimalesSecosNaNList = ({ animales }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secos/NaN</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>RP</Text>
          <Text style={styles.tableHeaderText}>eRP</Text>
          <Text style={styles.tableHeaderText}>Días Ausente</Text>
        </View>
        <FlatList
          data={animales}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.RP || 'RP desconocido'}</Text>
              <Text style={styles.tableCell}>{item.RFID?.replace(/⛔/g, '') || 'eRP desconocido'}</Text>
              <Text style={styles.tableCell}>{item.DiasAusente}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableCell: {
    flex: 1,
  },
});

export default AnimalesSecosNaNList;

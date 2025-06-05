import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, ActivityIndicator, FlatList, StyleSheet } from 'react-native';

const AnimalInfoModal = ({ setShowAnimalInfo, showAnimalInfo, selectedAnimals }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular una carga de datos
    const loadData = async () => {
      setLoading(true);
      try {
        // Aquí podrías hacer una llamada a una API o cargar datos
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de carga
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (showAnimalInfo) {
      loadData();
    }
  }, [showAnimalInfo]);

  const handleClose = () => {
    setShowAnimalInfo(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAnimalInfo}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1b829b" />
              <Text style={styles.loadingText}>CARGANDO...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.modalTitle}>Información de Animales</Text>
              <FlatList
                data={selectedAnimals}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()} // Asume que cada animal tiene un id único
                renderItem={({ item }) => (
                  <View style={styles.infoItem}>
                    <Text>RFID: {item.RFID}</Text>
                    <Text>RP: {item.RP}</Text>
                    <Text>Días Ausente: {item.DiasAusente}</Text>
                    {/* Agrega más campos según tu necesidad */}
                  </View>
                )}
              />
            </>
          )}
          <Button title="Cerrar" onPress={handleClose} color="#1b829b" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoItem: {
    marginBottom: 10,
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default AnimalInfoModal;

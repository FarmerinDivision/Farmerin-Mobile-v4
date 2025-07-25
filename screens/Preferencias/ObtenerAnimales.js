import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { db } from '../../database/firebase';

export default function ObtenerAnimalesMobile({ tambo }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [resumen, setResumen] = useState(null);

  const handleObtenerAnimales = async () => {
    if (!tambo?.id) return;

    try {
      // Vacas
      const vacasSnap = await db.collection('animal')
        .where('idtambo', '==', tambo.id)
        .where('mbaja', '==', '')
        .where('categoria', '==', 'Vaca')
        .get();

      const vacas = vacasSnap.docs.map(doc => doc.data());
      const vacasEnOrdeñe = vacas.filter(v => v.estpro === 'En Ordeñe').length;
      const vacasSecas = vacas.filter(v => v.estpro === 'seca').length;

      // Vaquillonas
      const vaqSnap = await db.collection('animal')
        .where('idtambo', '==', tambo.id)
        .where('mbaja', '==', '')
        .where('categoria', '==', 'Vaquillona')
        .get();

      const vaquillonas = vaqSnap.docs.map(doc => doc.data());
      const vaqEnOrdeñe = vaquillonas.filter(v => v.estpro === 'En Ordeñe').length;
      const vaqSecas = vaquillonas.filter(v => v.estpro === 'seca').length;
      const crias = vaquillonas.filter(v => v.estpro === 'cria').length;

      setResumen({
        vacas: vacas.length,
        vacasEnOrdeñe,
        vacasSecas,
        vaquillonas: vaquillonas.length,
        vaqEnOrdeñe,
        vaqSecas,
        crias
      });

      setModalVisible(true);
    } catch (error) {
      console.log('Error obteniendo animales:', error);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.boton} onPress={handleObtenerAnimales}>
        <Text style={styles.botonTexto}>Obtener Animales</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Resumen de Animales</Text>

            {resumen && (
              <ScrollView>
                <Text style={styles.texto}>🐄 Vacas: {resumen.vacas}</Text>
                <Text style={styles.texto}>En Ordeñe: {resumen.vacasEnOrdeñe}</Text>
                <Text style={styles.texto}>Secas: {resumen.vacasSecas}</Text>
                <Text style={styles.texto}>🐄 Vaquillonas: {resumen.vaquillonas}</Text>
                <Text style={styles.texto}>En Ordeñe: {resumen.vaqEnOrdeñe}</Text>
                <Text style={styles.texto}>Secas: {resumen.vaqSecas}</Text>
                <Text style={styles.texto}>Crías: {resumen.crias}</Text>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.cerrarBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
    boton: {
      backgroundColor: '#e6f9ef',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginVertical: 10
    },
    botonTexto: {
      color: '#004d00',
      fontWeight: 'bold',
      fontSize: 16
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20
    },
    modalCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5
    },
    modalTitulo: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center'
    },
    texto: {
      fontSize: 16,
      marginBottom: 8
    },
    cerrarBtn: {
      marginTop: 20,
      backgroundColor: '#004d00',
      padding: 10,
      borderRadius: 8,
      alignItems: 'center'
    },
    cerrarTexto: {
      color: '#fff',
      fontWeight: 'bold'
    }
  });
  
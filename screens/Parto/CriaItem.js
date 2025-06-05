import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function ListItem({ data, cria, setCria }) {
  const { id, rp, sexo, trat, peso } = data;

  function LeftActions(progress, dragX) {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftAction}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          Borrar Cría - RP: {rp}
        </Animated.Text>
      </View>
    );
  }

  function borrarCria() {
    const filtro = cria.filter(c => c.id !== id);
    setCria(filtro);
  }

  return (
    <Swipeable
      renderLeftActions={LeftActions}
      onSwipeableLeftOpen={borrarCria}
    >
      <View style={styles.container}>
        <Text style={styles.text}>
          Sexo: {sexo} - RP: {rp} - kg: {peso} - {trat}
        </Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10, // Bordes redondeados para un diseño más suave
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginVertical: 5, // Espaciado entre los elementos
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Sombra para dispositivos Android
  },
  text: {
    fontSize: 16,
    color: '#333', // Color de texto más oscuro
  },
  leftAction: {
    backgroundColor: '#FF3B30', // Color rojo más suave
    justifyContent: 'center',
    flex: 1,
    borderRadius: 10, // Bordes redondeados para la acción
  },
  actionText: {
    fontSize: 16,
    color: '#FFF',
    padding: 15, // Aumentar el padding para mejor toque
  },
});

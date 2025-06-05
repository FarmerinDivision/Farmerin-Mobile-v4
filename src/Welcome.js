// WelcomeScreen.js
import React from 'react';
import { View, Text, Image } from 'react-native';

const WelcomeScreen = () => {
  return (
    <View style={{ 
      flex: 1,
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#FFFFFF'
    }}>
      <Image
        source={require('../assets/logolargo2.png')} 
        style={{ 
          width: '70%',  // Ajusta el ancho al 80% del contenedor
          height: undefined,  // Altura automática basada en el aspect ratio
          aspectRatio: 1,  // Mantiene la proporción de la imagen
          resizeMode: 'contain'
        }} 
      />
    </View>
  );
};

export default WelcomeScreen;
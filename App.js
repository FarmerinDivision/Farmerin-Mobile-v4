import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Importa GestureHandlerRootView
import { Provider } from 'react-redux';
import store from './src/store';
import Eventos from './src/NavEventos';
import Config from './src/NavConfiguracion';
import OnBoardingNavigator from './src/NavSesiones';
import AuthLoading from './src/AuthLoading';
import { MovieProvider } from './screens/Contexto';
//import registerNNPushToken from 'native-notify';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'EVENTOS') {
          iconName = 'cow';
        } else if (route.name === 'CONFIGURACION') {
          iconName = 'cog';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#287fb9',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#F9F9F9',
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      headerStyle: {
        backgroundColor: '#287fb9',
      },
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#F9FFFF',
      },
      headerTintColor: '#F9FFFF',
    })}
  >
    <Tab.Screen
      name="EVENTOS"
      component={Eventos}
      options={{ title: 'EVENTOS' }}
    />
    <Tab.Screen
      name="CONFIGURACION"
      component={Config}
      options={{ title: 'CONFIGURACION' }}
    />
  </Tab.Navigator>
);

const BaseStack = () => (
  <Stack.Navigator initialRouteName="AuthLoading">
    <Stack.Screen
      name="AuthLoading"
      component={AuthLoading}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OnBoarding"
      component={OnBoardingNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Root"
      component={AppNavigator}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function App() {
  // registerNNPushToken(4382, 'XSlDDRiRyq1qAZLssswMTu');

  try {
    console.log('🚀 Iniciando aplicación Farmerin...');

    // Puedes colocar más validaciones aquí si lo necesitás, por ejemplo:
    if (!store) {
      throw new Error('❌ No se pudo cargar el store de Redux');
    }

    console.log('✅ Aplicación iniciada correctamente');

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <MovieProvider>
            <NavigationContainer>
              <BaseStack />
            </NavigationContainer>
          </MovieProvider>
        </Provider>
      </GestureHandlerRootView>
    );
  } catch (error) {
    console.error('💥 Error al iniciar la aplicación:', error);
    return null; // Evita que la app se rompa completamente
  }
}

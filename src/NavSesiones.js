import { NavigationContainer } from '@react-navigation/native'; // Agregar NavigationContainer
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Asegúrate de que esta importación sea correcta
import LoginScreen from '../screens/Login';
import Recuperar from '../screens/Recuperar';
import Register from '../screens/Register';

const Stack = createNativeStackNavigator(); // Crear la instancia del stack

export default function NavSesiones() {
    return (
            <Stack.Navigator
                initialRouteName="LogIn"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#4db150',
                        shadowOffset: { width: 1, height: 1 },
                        elevation: 3,
                        borderBottomWidth: 1,
                        borderBottomColor: 'white'
                    },
                    headerTintColor: '#fff',
                    headerShown: false
                }}
            >
                <Stack.Screen
                    name="Register"
                    component={Register}
                    options={{ headerTitle: "REGISTRAR",  headerShown: false }}
                />
                <Stack.Screen
                    name="Recuperar"
                    component={Recuperar}
                    options={{ headerTitle: "RECUPERAR CONTRASEÑA",  headerShown: false }}
                />
                <Stack.Screen
                    name="LogIn"
                    component={LoginScreen}
                    options={{ headerTitle: "INICIAR SESIÓN", headerShown: false }}
                />
            </Stack.Navigator>
    );
}
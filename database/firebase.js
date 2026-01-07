import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATYDND7IQvZV6_2EqKDCX3xHzgSVr51qo",
  authDomain: "farmerin-navarro.firebaseapp.com",
  databaseURL: "https://farmerin-navarro.firebaseio.com",
  projectId: "farmerin-navarro",
  storageBucket: "farmerin-navarro.appspot.com",
  messagingSenderId: "684596883598",
  appId: "1:684596883598:web:5ec34bd86443ba0b40d9df",
  measurementId: "G-8NQR6HE295"
};

// Inicializar Firebase si no está ya inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Inicializar servicios compat
const db = firebase.firestore();
const almacenamiento = firebase.storage();
const autenticacion = firebase.auth();

console.log('🔐 Firebase Auth (compat) inicializada.');

// Persistencia OFFLINE Firestore
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log("⚠️ La persistencia offline solo se puede habilitar en una pestaña a la vez.");
    } else if (err.code === 'unimplemented') {
      console.log("⚠️ El dispositivo actual no admite persistencia offline.");
    }
  });

/**
 * 🔥 PERSISTENCIA DE SESIÓN EN REACT NATIVE
 * En React Native con Firebase compat, la persistencia funciona automáticamente
 * No necesitamos configurar setPersistence() ya que Firebase Auth maneja esto internamente
 * usando el almacenamiento nativo del dispositivo
 */
console.log("🔐 Persistencia de sesión automática (Firebase compat en React Native)");

// Exportar servicios
export { almacenamiento, autenticacion, db };

export default {
  firebase,
  db,
  autenticacion,
  almacenamiento
};

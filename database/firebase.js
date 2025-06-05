import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

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

// Configurar Firestore con persistencia offline
const db = firebase.firestore();
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log("La persistencia offline solo se puede habilitar en una pestaña a la vez.");
    } else if (err.code === 'unimplemented') {
      console.log("El navegador actual no admite la persistencia sin conexión.");
    }
  });

// Configurar almacenamiento y autenticación
const almacenamiento = firebase.storage();
const autenticacion = firebase.auth();

// Exportar servicios de Firebase para uso en otros archivos
export { almacenamiento, autenticacion, db };

// Obtener usuario autenticado (si lo necesitas para depuración)
const user = autenticacion.currentUser;
console.log("Usuario autenticado:", user);

export default {
  firebase,
  db,
  autenticacion,
  almacenamiento
};

import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '../database/firebase';

export default ({ navigation }) => {

  useEffect(() => {
    console.log("🚀 Iniciando verificación de sesión...");

    let unsubscribe = null;
    let timeout = null;
    let hasNavigated = false; // Flag para evitar navegación múltiple

    const checkAuthState = async () => {
      try {
        // Verificar preferencia de recordar sesión
        const remember = await AsyncStorage.getItem('rememberSession');
        const shouldRemember = remember === 'true';
        console.log("📝 Preferencia recordar sesión:", shouldRemember);

        // Verificar si hay un usuario guardado en AsyncStorage
        const savedUserId = await AsyncStorage.getItem('usuario');
        console.log("💾 Usuario guardado en AsyncStorage:", savedUserId || "ninguno");

        // Verificar usuario actual de Firebase inmediatamente
        let currentUser = firebase.autenticacion.currentUser;
        if (currentUser) {
          console.log("✅ Usuario encontrado inmediatamente en Firebase:", currentUser.uid);
          if (!hasNavigated) {
            hasNavigated = true;
            await AsyncStorage.setItem('usuario', currentUser.uid);
            await AsyncStorage.setItem('nombre', currentUser.displayName || currentUser.email || 'Usuario');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Root' }]
            });
            return;
          }
        }

        // Si hay un usuario guardado pero Firebase no lo tiene aún, esperar un momento
        // Firebase Auth puede tardar en restaurar la sesión
        if (savedUserId && shouldRemember && !currentUser) {
          console.log("⏳ Usuario guardado encontrado, esperando restauración de Firebase Auth...");
          // Esperar 1 segundo y verificar de nuevo
          await new Promise(resolve => setTimeout(resolve, 1000));
          currentUser = firebase.autenticacion.currentUser;
          if (currentUser && !hasNavigated) {
            console.log("✅ Usuario restaurado después de esperar:", currentUser.uid);
            hasNavigated = true;
            await AsyncStorage.setItem('usuario', currentUser.uid);
            await AsyncStorage.setItem('nombre', currentUser.displayName || currentUser.email || 'Usuario');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Root' }]
            });
            return;
          }
        }

        // Escucha en Firebase Auth - esto se ejecutará cuando Firebase termine de verificar la sesión
        unsubscribe = firebase.autenticacion.onAuthStateChanged(async (user) => {
          if (hasNavigated) return; // Evitar navegación múltiple
          
          console.log("🔐 Estado de autenticación:", user ? `Usuario: ${user.uid}` : "Sin usuario");

          if (user) {
            console.log("✅ Sesión encontrada en Firebase:", user.uid);
            hasNavigated = true;

            // Guardar información por si tu app la usa
            try {
              await AsyncStorage.setItem('usuario', user.uid);
              await AsyncStorage.setItem('nombre', user.displayName || user.email || 'Usuario');
              
              // Si no hay preferencia guardada, establecerla como true por defecto
              const currentRemember = await AsyncStorage.getItem('rememberSession');
              if (currentRemember === null) {
                await AsyncStorage.setItem('rememberSession', 'true');
              }
            } catch (storageError) {
              console.log("⚠️ Error guardando en AsyncStorage:", storageError);
            }

            // Entrar a la app
            navigation.reset({
              index: 0,
              routes: [{ name: 'Root' }]
            });

          } else {
            // No hay usuario logueado en Firebase
            console.log("❌ No hay usuario en Firebase.");

            // Si hay un usuario guardado pero Firebase no lo tiene, puede ser que aún esté cargando
            // O que Firebase compat no haya restaurado la sesión (problema conocido en React Native)
            if (savedUserId && shouldRemember) {
              console.log("⏳ Esperando restauración de sesión...");
              // Esperar 2 segundos más antes de decidir
              setTimeout(async () => {
                const userAfterWait = firebase.autenticacion.currentUser;
                if (userAfterWait && !hasNavigated) {
                  console.log("✅ Sesión restaurada después de esperar:", userAfterWait.uid);
                  hasNavigated = true;
                  await AsyncStorage.setItem('usuario', userAfterWait.uid);
                  await AsyncStorage.setItem('nombre', userAfterWait.displayName || userAfterWait.email || 'Usuario');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Root' }]
                  });
                } else if (!hasNavigated) {
                  // Firebase compat en React Native no restaura la sesión automáticamente
                  // Si hay un usuario guardado y la preferencia está activa, verificar token
                  console.log("⚠️ Firebase no restauró la sesión automáticamente");
                  
                  // Verificar si hay un token guardado
                  const savedToken = await AsyncStorage.getItem('authToken');
                  const savedEmail = await AsyncStorage.getItem('userEmail');
                  
                  if (savedToken && savedEmail) {
                    console.log("✅ Token y email encontrados, permitiendo acceso (workaround)");
                    console.log("⚠️ NOTA: Algunas funciones pueden requerir re-autenticación");
                    hasNavigated = true;
                    
                    // Permitir acceso a la app aunque Firebase no tenga la sesión activa
                    // Esto es un workaround para el problema de persistencia en Firebase compat
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Root' }]
                    });
                  } else {
                    console.log("❌ No hay token guardado, sesión expirada o inválida");
                    hasNavigated = true;
                    // Limpiar datos inválidos
                    await AsyncStorage.removeItem('usuario');
                    await AsyncStorage.removeItem('nombre');
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('userEmail');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'OnBoarding' }]
                    });
                  }
                }
              }, 2000);
            } else {
              // No hay usuario guardado o no quiere recordar
              hasNavigated = true;
              
              // Limpiar datos guardados solo si no quiere recordar sesión
              if (!shouldRemember) {
                try {
                  await AsyncStorage.removeItem('usuario');
                  await AsyncStorage.removeItem('nombre');
                  console.log("🧹 Datos de sesión limpiados (preferencia: no recordar)");
                } catch (storageError) {
                  console.log("⚠️ Error limpiando AsyncStorage:", storageError);
                }
              }

              navigation.reset({
                index: 0,
                routes: [{ name: 'OnBoarding' }]
              });
            }
          }
        });

        // Timeout de seguridad: si después de 5 segundos no hay respuesta, verificar manualmente
        timeout = setTimeout(() => {
          if (!hasNavigated) {
            firebase.autenticacion.currentUser
              .then((currentUser) => {
                if (currentUser && !hasNavigated) {
                  console.log("⏱️ Timeout: Usuario encontrado manualmente:", currentUser.uid);
                  hasNavigated = true;
                  AsyncStorage.setItem('usuario', currentUser.uid);
                  AsyncStorage.setItem('nombre', currentUser.displayName || currentUser.email || 'Usuario');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Root' }]
                  });
                } else if (!hasNavigated) {
                  console.log("⏱️ Timeout: No se detectó sesión activa");
                  hasNavigated = true;
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'OnBoarding' }]
                  });
                }
              })
              .catch((err) => {
                console.log("⚠️ Error verificando usuario actual:", err);
                if (!hasNavigated) {
                  hasNavigated = true;
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'OnBoarding' }]
                  });
                }
              });
          }
        }, 5000);
      } catch (error) {
        console.log("❌ Error en verificación de sesión:", error);
        if (!hasNavigated) {
          hasNavigated = true;
          navigation.reset({
            index: 0,
            routes: [{ name: 'OnBoarding' }]
          });
        }
      }
    };

    checkAuthState();
    
    // Función de limpieza
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1b829b" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

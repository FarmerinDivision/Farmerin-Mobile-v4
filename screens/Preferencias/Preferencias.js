import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Modal } from "react-native";
import ListItem from "./ListItem";
import { useRoute } from '@react-navigation/core';
import { autenticacion } from '../../database/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
export default ({ navigation }) => {

  const route = useRoute();
  const {tambo} = route.params;

  const [admin, setAdmin]=useState(false)
  const [mostrarUsuario, setMostrarUsuario] = useState(false)
  const [usuarioInfo, setUsuarioInfo] = useState({})
  const Separator = () => <View style={{ flex: 1, height: 1, backgroundColor: '#ffff' }}></View>

  useEffect(
    ()=>{
      if (tambo.id == "M324egnsekSUcxyzq9YD") {
        setAdmin(true);
      }
      obtenerUsuarioInfo();
    }
,[]);

  const obtenerUsuarioInfo = async () => {
    try {
      const usuario = await AsyncStorage.getItem('usuario');
      const nombre = await AsyncStorage.getItem('nombre');
      setUsuarioInfo({ usuario, nombre });
    } catch (error) {
      console.log('Error al obtener información del usuario:', error);
    }
  }

  const DATA = [
    {
      title: "INFORMACIÓN DEL USUARIO",
      id: 0,
      navegar: "mostrarUsuario"
    },
    {
      title: "ELIMINAR CUENTA",
      id: 1,
      red: true,
      navegar: "EliminarCuenta"
    },
  /*  {
      title: "ENVIAR NOTIFICACIONES",
      id: 2, 
      navegar: "Notificaciones",
      isAdmin: admin
    },
    {
      title: "INGRESOS EN TAMBO EXPO",
      id: 3, 
      navegar: "Logueos",
      isAdmin: admin
    }*/
  ]
  return (
    <View style={styles.container}>
      <View style={styles.listado}>
        <ListItem navigation={navigation} tambo={tambo} />
        
        {/* Lista de opciones adicionales */}
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                item.red && styles.optionItemRed
              ]}
                             onPress={() => {
                 if (item.navegar === "mostrarUsuario") {
                   setMostrarUsuario(true);
                 } else if (item.navegar === "EliminarCuenta") {
                   // Aquí puedes agregar la lógica para eliminar cuenta
                   console.log("Eliminar cuenta");
                 } else if (item.navegar && navigation) {
                   navigation.navigate(item.navegar, { tambo });
                 }
               }}
            >
              <Text style={[
                styles.optionText,
                item.red && styles.optionTextRed
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
y                     ItemSeparatorComponent={() => <View style={styles.separator} />}
         />
       </View>

       {/* Modal de información del usuario */}
       <Modal
         visible={mostrarUsuario}
         transparent
         animationType="fade"
         onRequestClose={() => setMostrarUsuario(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.usuarioModal}>
             <Text style={styles.usuarioTitulo}>👤 Información del Usuario</Text>
             
        
             
             <View style={styles.usuarioInfo}>
               <Text style={styles.usuarioLabel}>Nombre:</Text>
               <Text style={styles.usuarioValor}>{usuarioInfo.nombre || 'No disponible'}</Text>
             </View>
             
             <View style={styles.usuarioInfo}>
               <Text style={styles.usuarioLabel}>Tambo:</Text>
               <Text style={styles.usuarioValor}>{tambo?.nombre || 'No disponible'}</Text>
             </View>
          

             <TouchableOpacity
               style={styles.botonCerrar}
               onPress={() => setMostrarUsuario(false)}
             >
               <Text style={styles.botonCerrarTexto}>CERRAR</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
     </View>
   );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1e8ee",
  },
  linea: {
    height: 1,
    backgroundColor: '#2980B9',
    marginVertical: 25
  },
  listado: {
  },
  titulo: {
    marginVertical: 15,
    marginLeft: 23
  },
  textocon: {
    fontSize: 18,
    color: '#505050',
  },
  optionItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItemRed: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ffcccc',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  optionTextRed: {
    color: '#cc0000',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usuarioModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  usuarioTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1b829b',
    textAlign: 'center',
  },
  usuarioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  usuarioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  usuarioValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b829b',
    flex: 1,
    textAlign: 'right',
  },
  botonCerrar: {
    backgroundColor: '#1b829b',
    marginTop: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  botonCerrarTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

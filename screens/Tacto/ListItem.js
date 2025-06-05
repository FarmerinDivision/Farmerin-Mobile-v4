import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'

export default function ListItem({ data, animales, guardarAnimales }) {

  const { id, rp, estrep, fservicio, diasPre, pre, categoria, estpro, diasServicio, nservicio } = data;
  const [siglas, guardarSiglas] = useState({
    cat: 'VC',
    prod: 'S',
    rep: 'V'
  })
  const [servicio, setServicio] = useState('');

  useEffect(() => {

    if (fservicio) {
      const s = format(new Date(fservicio), 'dd/MM/yy');
      setServicio(s);
    } else {
      setServicio(' ')
    }

    let c = 'VC';
    let p = 'S';
    let r = 'V';

    if (categoria != 'Vaca') c = 'VQ';
    if (estpro != 'seca') p = 'O';
    if (estrep != 'vacia') r = 'P'

    guardarSiglas({
      cat: c,
      prod: p,
      rep: r
    })

  }, []);



  function cancelConfirmar() {
    if (pre) {
      const animalesAct = animales.map(a => {
        // Revisamos que la llave recibida coincida con el elemento que queremos actualizar
        if (a.id === id) {
          a.pre = false;
        }
        // Si no es el elemento que deseamos actualizar lo regresamos tal como está
        return a;
      });

      guardarAnimales(animalesAct);
    }
  }

  function confirmar() {
      if (!pre) {
        const animalesAct = animales.map(a => {
          // Revisamos que la llave recibida coincida con el elemento que queremos actualizar
          if (a.id === id) {
            a.pre = true;
            //console.log(a.id);
          }
          // Si no es el elemento que deseamos actualizar lo regresamos tal como está
          return a;
        });

        guardarAnimales(animalesAct);

      }
  }

  return (
    <>
      {pre ?
        <TouchableOpacity style={styles.container2} onPress={cancelConfirmar}>
          <Text style={styles.text2}>RP: {rp} - ULT.SERV: {servicio} - {diasServicio} DIAS</Text>
        </TouchableOpacity> 
        :
        <TouchableOpacity onPress={confirmar}>
                <View style={styles.container} onPress={confirmar}>
            <Text style={styles.text}>RP: {rp} - ULT.SERV: {servicio} - {diasServicio} DIAS</Text>
            </View>
        </TouchableOpacity>
        }
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // Fondo blanco para los elementos
    borderRadius: 15, // Bordes redondeados
    padding: 15, // Espacio interno
    marginBottom: 1, // Espacio entre elementos
    shadowColor: '#000', // Sombra para darle profundidad
    shadowOffset: { width: 0, height: 5 }, // Offset de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 10, // Difusión de la sombra
    elevation: 5, // Elevación en Android
    borderWidth: 1, // Borde definido
    borderColor: '#e0e0e0', // Color del borde
  },
  container2: {
    backgroundColor: '#4db150', // Fondo blanco para los elementos
    borderRadius: 15, // Bordes redondeados
    padding: 15, // Espacio interno
    marginBottom: 1, // Espacio entre elementos
    shadowColor: '#000', // Sombra para darle profundidad
    shadowOffset: { width: 0, height: 5 }, // Offset de la sombra
    shadowOpacity: 0.1, // Opacidad de la sombra
    shadowRadius: 10, // Difusión de la sombra
    elevation: 5, // Elevación en Android
    borderWidth: 1, // Borde definido
    borderColor: '#e0e0e0', // Color del borde
  },
  text: {
    fontSize: 16,
    color: '#333', // Color oscuro para el texto
  },
  text2: {
    fontSize: 16,
    color: '#ffff'
  },
  leftAction: {
    backgroundColor: '#249E31',
    justifyContent: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#FFF',
    padding: 15,
  },
  leftAction2: {
    backgroundColor: '#F39C12',
    justifyContent: 'center',
    flex: 1,
  },
});
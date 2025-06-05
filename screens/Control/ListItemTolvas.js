import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';
import { useFormik } from 'formik';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


export default function ListItemTolvas({ data, animalesControl, updateControl, nuevoControl }) {

  const { id, rp, orden } = data;
  const [visible, setVisible] = useState(false);
  const [varLtsm, setVarLtsm] = useState('');
  const [varLtst, setVarLtst] = useState('');
  const [varAnorm, setVarAnorm] = useState('');
  const [existe, setExiste] = useState(false);
  const [iden,setIden]=useState('');

  useEffect(() => {
    validarAnimales()

  }, []);

  useEffect(() => {
    validarAnimales()

  }, [animalesControl]);


  function validarAnimales(){

    let cond = id.toString();
    const animal = animalesControl.filter(animal => {
      return (
        animal.erp.toString().toLowerCase().includes(cond)
      )
    });

    if (animal.length > 0) {
      setIden(animal[0].id);
      setExiste(true);
      setVarAnorm(animal[0].anorm);
      setVarLtsm(animal[0].ltsm);
      setVarLtst(animal[0].ltst);
    }

  }


  const validate = values => {
    const errors = {}

    if (!values.ltsm && !values.ltst) {
      errors.lts = "DEBE INGRESAR LOS LITROS"
    }
    if (!values.ltsm && isNaN(values.ltsm)) {
      errors.lts = "DEBE INGRESAR UN NUMERO"
    }
    return errors
  }

  const formControl = useFormik({
    initialValues: {
      ltsm: varLtsm,
      ltst: varLtst,
      anorm: varAnorm,
    },
    validate,
    onSubmit: datos => guardarControl(datos)
  })

  function guardarControl(datos) {

    setVarLtsm(datos.ltsm);
    setVarLtst(datos.ltst);
    setVarAnorm(datos.anorm);
    let ac;

    let ltsm='';
    let ltst='';
    if (datos.ltsm) ltsm=parseFloat(datos.ltsm);
    if (datos.ltst) ltst=parseFloat(datos.ltst);
    if (existe) {

      ac =
      {
       
        ltsm: ltsm,
        ltst: ltst,
        anorm: datos.anorm
      }
      updateControl(iden,ac);
    } else {
      ac =
      {
        rp: rp,
        erp: id,
        ltsm: ltsm,
        ltst: ltst,
        anorm: datos.anorm
      }
      nuevoControl(ac);
     
    }
    setExiste(true);
    setVisible(false);
  }

  function cerrar() {

    setVisible(false);
    formControl.setFieldValue('ltsm', varLtsm.toString());
    formControl.setFieldValue('ltst', varLtst.toString());
    formControl.setFieldValue('anorm', varAnorm);

  }

  function abrirRegistrarControl() {

    formControl.setFieldValue('ltsm', varLtsm.toString());
    formControl.setFieldValue('ltst', varLtst.toString());
    formControl.setFieldValue('anorm', varAnorm);
    setVisible(true)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>RP: {rp} - Orden: {orden}</Text>
      <Text style={styles.infoText}>eRP: {id}</Text>
      <Text style={styles.infoText}>Lts. Mañana: {varLtsm} - Lts. Tarde: {varLtst}</Text>
      <Text style={styles.infoText}>Anormalidad: {varAnorm}</Text>

      <Button
        title="Registrar Control"
        onPress={abrirRegistrarControl}
        buttonStyle={styles.button}
        type="outline"
        icon={<Icon name="edit" size={30} color="#3390FF" />}
      />
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
      >
        <View style={styles.modalCenter}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>RP: {rp}</Text>
              <Text style={styles.modalHeaderText}>eRP: {id}</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LTS. MAÑANA:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formControl.values.ltsm}
                  onChangeText={formControl.handleChange('ltsm')}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LTS. TARDE:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formControl.values.ltst}
                  onChangeText={formControl.handleChange('ltst')}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            {formControl.errors.lts && <Text style={styles.errorText}>{formControl.errors.lts}</Text>}
            
            <Text style={styles.inputLabel}>ANORMALIDAD:</Text>
            <TextInput
              style={styles.textInput}
              value={formControl.values.anorm}
              onChangeText={formControl.handleChange('anorm')}
            />
            
            <Button
              onPress={formControl.handleSubmit}
              title="Guardar"
              buttonStyle={styles.button}
              icon={<Icon name="check-square" size={30} color="white" />}
            />
            
            <Button
              onPress={cerrar}
              title="Cerrar"
              type="outline"
              buttonStyle={styles.outlineButton}
              titleStyle={styles.outlineButtonTitle}
              icon={<Icon name="window-close" size={30} color="#2980B9" />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#1b829b',
    borderRadius: 8,
    marginVertical: 10,
  },
  modalCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: wp('80%'),
    height: hp('60%'),
  },
  modalHeader: {
    backgroundColor: '#2980B9',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalHeaderText: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    height: 50,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 13,
    color: 'red',
    marginVertical: 5,
    textAlign: 'center',
  },
  outlineButton: {
    borderColor: '#2980B9',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
  },
  outlineButtonTitle: {
    color: '#2980B9',
  },
});
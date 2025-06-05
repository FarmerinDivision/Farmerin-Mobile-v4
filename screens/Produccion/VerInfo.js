import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { format } from 'date-fns';

export default function ({ setShowTambos, showTambos, data }) {
    const [loading, setLoading] = useState(false);
    const f = new Date(data.fecha.toDate());
    const ff = format(f, 'dd/MM/yy')
    return (
        <>
            <Modal
                animationType='fade'
                transparent={true}
                visible={showTambos}
            >
                <TouchableWithoutFeedback onPress={() => {
                    setShowTambos(false)
                }}>
                    <View style={styles.center}>

                        <View style={styles.content}>

                            {loading ?
                                <>
                                    <View style={styles.header}>
                                        <Text style={styles.text2}>CARGANDO...</Text>
                                    </View>
                                    <ActivityIndicator size="large" color='#1b829b' />
                                </>
                                :
                                <>
                                    <View style={styles.header}>
                                        <Text style={styles.text2}>FECHA: {ff}</Text>
                                    </View>

                                    <View style={styles.info}>
                                        <View style={styles.row}>
                                            <Text style={styles.textoinfoA}> LITROS PRODUCIDOS: </Text>
                                            <Text style={styles.texto1A}>{data.produccion} Lts. </Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.textoinfo}> LITROS ENTREGADOS: </Text>
                                            <Text style={styles.texto1}>{data.entregados} Lts. </Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.textoinfo}> LITROS GUACHERA: </Text>
                                            <Text style={styles.texto1}>{data.guachera} Lts. </Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.textoinfo}> LISTROS DESCARTE: </Text>
                                            <Text style={styles.texto1}>{data.descarte} Lts. </Text>
                                        </View>
                                    </View>
                                </>
                            }
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>

    );
}



const styles = StyleSheet.create({

    text2: {
        color: '#e1e8ee',
        textAlign: 'center',
        fontSize: 18,
        marginTop: 10,

        fontWeight: "bold"
    },

    center: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    info: {
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    textoinfo: {
        fontSize: 18,
        marginBottom: 3,
        fontWeight: "bold",
        color: "#696969"
    },
    textoinfoA: {
        fontSize: 22,
        marginBottom: 3,
        fontWeight: "bold",
        color: "black"
    },
    textoinfo2: {
        textTransform: "uppercase",
        fontSize: 18,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    row: {
        flexDirection: "row",
        marginBottom: 3
    },
    texto1: {
        fontSize: 18,
        marginBottom: 3,
        color: "#696969"
    },
    texto1A: {
        fontSize: 22,
        color: "black",
        fontWeight: "bold"
    },
    header: {

        backgroundColor: '#2980B9',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: 7
    },
    content: {
        backgroundColor: '#e1e8ee',
        borderWidth: 1,
        borderColor: 'white',
        margin: 20,
        marginTop: hp('30%'),
        borderRadius: 15,
        height: 200,
        paddingBottom: 10
    },

});

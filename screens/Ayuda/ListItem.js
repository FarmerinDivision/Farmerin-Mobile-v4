import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image, Dimensions  } from 'react-native';

export default function ListItem({ data, linkeo}) {

  const { title,logo} = data;
  return (
    <TouchableHighlight onPress={linkeo}
    >
      <View style={styles.container}>
        <View style={styles.row}><Image resizeMode={'contain'} style={styles.logo} source={logo} />
        <Text style={styles.text}>{title}</Text>
        </View>
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e8ee',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  text: {
    fontSize: 19,
    color:'#070037',
    paddingTop: 3
  },

  logo:{
    marginRight: 35,
    width: 33,
    height: 33,
    marginLeft: 13
  },
  row:{
flexDirection: "row"
  },

});
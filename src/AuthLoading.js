import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default ({ navigation }) => {
  useEffect(() => {
   
    AsyncStorage.getItem('usuario').then(x=>{navigation.navigate(x?'Root':'OnBoarding')})
    
  }, []);


  return (
    <View>
      <ActivityIndicator size="large" color='#1b829b' />
    </View>
  )
}

// CustomBarChart.js
import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Obtener el ancho de la pantalla
const screenWidth = Dimensions.get('window').width;

const CustomBarChart = ({ data, width = screenWidth, height = 220 }) => {
  // Verifica si el objeto data tiene la estructura correcta
  const isDataValid = data && data.labels && data.datasets && data.datasets.length > 0;

  return (
    <View>
      {isDataValid ? (
        <BarChart
          data={data}
          width={width}
          height={height}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f0f0f0',
            decimalPlaces: 2, // opcional
            color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', height }}>
          <Text>CARGANDO...</Text>
        </View>
      )}
    </View>
  );
};

export default CustomBarChart;

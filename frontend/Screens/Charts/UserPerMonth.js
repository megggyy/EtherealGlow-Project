import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from "../../assets/common/baseurl";

const UsersPerMonthChart = () => {
  const [usersPerMonthData, setUsersPerMonthData] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const fetchUsersPerMonthData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      console.log("JWT Token:", token); // Log the token value
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      };

      const { data } = await axios.get(`http://172.20.10.4:4000/api/v1/users/usersPerMonth`, config);  
      setUsersPerMonthData(data.getUsersPerMonth);
      console.log(data.getUsersPerMonth);
    } catch (error) {
      console.error('Error fetching users per month data:', error);
    }
  };
  
  useEffect(() => {
    fetchUsersPerMonthData();
  }, []);

  const data = {
    labels: usersPerMonthData.map(item => item.month),
    datasets: [{
      data: usersPerMonthData.map(item => item.total)
    }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users Per Month Chart</Text>
      <View style={{ paddingHorizontal: 20 }}>
        <BarChart
          data={data}
          width={Dimensions.get('window').width - 40} // Adjusted width with padding
          height={250}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0, // Adjusted decimalPlaces to 0 since it represents user count
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.5,
          }}
          style={{
            borderRadius: 16,
          }}
          fromZero={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Added padding for overall padding
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default UsersPerMonthChart;

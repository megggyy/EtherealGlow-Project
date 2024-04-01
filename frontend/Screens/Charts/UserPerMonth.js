import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from "../../assets/common/baseurl";

const UsersPerMonthChart = () => {
  const [usersPerMonthData, setUsersPerMonthData] = useState([]);
  const [sales, setSales] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [moodLine, setMoodLine] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // Default mood line data

  const fetchUsersPerMonthData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      console.log("JWT Token:", token);
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

  const fetchSalesData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      };
  
      const { data } = await axios.get(`http://172.20.10.4:4000/api/v1/orders/salesPerMonth`, config);
      
      // Create default mood line array with zeros for all 12 months
      const defaultMoodLine = Array(12).fill(0);
  
      // Iterate over fetched sales data and assign totals to corresponding months
      const salesData = data.salesPerMonth.reduce((acc, { month, total }) => {
        // Assuming month names are abbreviated (e.g., Jan, Feb, etc.)
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        if (monthIndex !== -1) {
          acc[monthIndex] = total;
        }
        return acc;
      }, [...defaultMoodLine]);
  
      // Set merged data (sales data merged with default mood line)
      setMoodLine(salesData);
  
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  
  
  useEffect(() => {
    fetchUsersPerMonthData();
    fetchSalesData();
  }, []);

  const data = {
    labels: usersPerMonthData.map(item => item.month),
    datasets: [{
      data: usersPerMonthData.map(item => item.total)
    }]
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Assuming month labels
    datasets: [{
      data: moodLine // Use the merged data as chart data
    }]
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Users Per Month Chart</Text>
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
      <View style={styles.container}>
        <Text style={styles.title}>Monthly Sales Chart</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40} // Adjusted width with padding
          height={250}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{
            borderRadius: 16,
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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

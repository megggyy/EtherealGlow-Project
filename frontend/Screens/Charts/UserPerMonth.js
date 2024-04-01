import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from "../../assets/common/baseurl";

const UsersPerMonthChart = () => {
  const [usersPerMonthData, setUsersPerMonthData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [sales, setSales] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [moodLine, setMoodLine] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); 

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
  
      const salesData = data.salesPerMonth.reduce((acc, { month, total }) => {
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        if (monthIndex !== -1) {
          acc[monthIndex] = total;
        }
        return acc;
      }, [...defaultMoodLine]);
  
      setMoodLine(salesData);
  
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  
  const fetchCategoryData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      };

      const { data } = await axios.get(`http://172.20.10.4:4000/api/v1/products/getProductCountByCategory`, config);  
      setCategoryData(data);
      console.log(data.getProductCountByCategory);
    } catch (error) {
      console.error('Error fetching users per month data:', error);
    }
  };

  useEffect(() => {
    fetchUsersPerMonthData();
    fetchSalesData();
    fetchCategoryData();
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
      data: moodLine 
    }]
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Users Per Month Chart</Text>
        <BarChart
          data={data}
          width={Dimensions.get('window').width - 40} 
          height={250}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0, 
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
      <View style={styles.container}>
      <Text style={styles.title}>Products per Category</Text>
      <PieChart
        data={categoryData.map(category => ({
          name: category.category,
          count: category.count,
          color: '#' + ((Math.random() * 0xffffff) << 0).toString(16)
        }))}
        width={Dimensions.get('window').width - 40} 
        height={200}
        chartConfig={{
          backgroundGradientFrom: '#1E2923',
          backgroundGradientTo: '#08130D',
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
      />
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default UsersPerMonthChart;

import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import Header from './Shared/Header';
import { NativeBaseProvider, extendTheme, } from "native-base";
import { NavigationContainer } from '@react-navigation/native'
import Main from './Navigators/Main';

import { Provider } from "react-redux";
import store from "./Redux/store";
import Toast from "react-native-toast-message"
import Auth from './Context/Store/Auth';
import DrawerNavigator from './Navigators/DrawerNavigator';
const theme = extendTheme({ colors: newColorTheme });
const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  },
};
export default function App() {
  return (
    <Auth>
      <Provider store={store}>
        <NativeBaseProvider theme={theme}>
          <NavigationContainer>
            <Header />
            <DrawerNavigator />
            {/* <Main /> */}
            <Toast />
          </NavigationContainer>
        </NativeBaseProvider>
      </Provider>
    </Auth>
  );
}



import React, { Component } from 'react';
import { ScrollView, Dimensions, StyleSheet, Text } from 'react-native';

var { width } = Dimensions.get('window');

const TitleContainer = ({children, title}) => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {children}
    </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginBottom: 400,
        width: width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
    }
})


export default TitleContainer;
import React, { useState, useEffect } from "react";
import { Image, View, StyleSheet, Text, ScrollView, Button } from "react-native";
import { Left, Right, Container, H1, Center, Heading } from 'native-base'
import EasyButton from "../../Shared/StyledComponents/EasyButton"
import TrafficLight from '../../Shared/StyledComponents/TrafficLight'
const SingleCategory = ({ route }) => {
    const [item, setItem] = useState(route.params.item);
 
    const getFirstImage = () => {
        if (Array.isArray(item.image) && item.image.length > 0) {
            return item.image[0].url;
        }
        return 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
    };

    return (
        <Center flexGrow={1}>
            <ScrollView style={{ marginBottom: 80, padding: 5 }}>
                <View>
                    
                <Image
                        source={{
                            uri: getFirstImage()
                        }}
                        resizeMode="contain"
                        style={styles.image}
                    />


                </View> 
                <View style={styles.contentContainer}>
                    <Heading style={styles.contentHeader} size='xl'>{item.name}</Heading>
                    <Text style={styles.contentText}>{item.description}</Text>
                </View>
                {/* <View style={styles.availabilityContainer}>
                    <View style={styles.availability}>
                        <Text style={{ marginRight: 10 }}>
                            Availability: {availabilityText}
                        </Text>
                        {availability}
                    </View>
                  
                </View> */}
                {/* <EasyButton
                    primary
                    medium
                >

                    <Text style={{ color: "white" }}> Add</Text>
                </EasyButton> */}
            </ScrollView>
        </Center >
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: '100%',

    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 0,
        margin: 0
    },
    image: {
        width: '100%',
        height: undefined,
        aspectRatio: 1
    },
    contentContainer: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentHeader: {
        fontWeight: 'bold',
        marginBottom: 20
    },
    contentText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white'
    },
    price: {
        fontSize: 24,
        margin: 20,
        color: 'red'
    },
    availabilityContainer: {
        marginBottom: 20,
        alignItems: "center"
    },
    availability: {
        flexDirection: 'row',
        marginBottom: 10,
    }
})

export default SingleCategory

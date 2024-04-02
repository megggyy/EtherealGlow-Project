import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Container, Center } from "native-base"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

import AsyncStorage from '@react-native-async-storage/async-storage'

import axios from "axios"
import baseURL from "../../assets/common/baseurl"
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import AuthGlobal from "../../Context/Store/AuthGlobal"
import { logoutUser } from "../../Context/Actions/Auth.actions"
import OrderCard from '../../Shared/OrderCard';

var { width, height } = Dimensions.get("window");
const UserProfile = (props) => {
    const context = useContext(AuthGlobal)
    const [userProfile, setUserProfile] = useState('')
    const [orders, setOrders] = useState([])
    const navigation = useNavigation()

    useFocusEffect(
        useCallback(() => {
            if (
                context.stateUser.isAuthenticated === false ||
                context.stateUser.isAuthenticated === null
            ) {
                navigation.navigate("Login")
            }
            console.log("context", context.stateUser.user)
            AsyncStorage.getItem("jwt")
                .then((res) => {
                    axios
                        .get(`${baseURL}users/${context.stateUser.user.userId}`, {
                            headers: { Authorization: `Bearer ${res}` },
                        })
                        .then((user) => setUserProfile(user.data))
                })
                .catch((error) => console.log(error))
            axios
                .get(`${baseURL}orders`)
                .then((x) => {
                    const data = x.data;
                    console.log(data)
                    const userOrders = data.filter(
                        (order) =>
                            // console.log(order)
                            order.user ? (order.user._id === context.stateUser.user.userId) : false

                    );
                    setOrders(userOrders);
                })
                .catch((error) => console.log(error))
            return () => {
                setUserProfile();
                setOrders()
            }

        }, [context.stateUser.isAuthenticated]))

    return (
        <Center>
            <ScrollView contentContainerStyle={styles.container}>
            
            <View style={styles.imageContainer}>
                {userProfile?.image && (
                    <Image style={styles.image} source={{ uri: userProfile.image }} />
                )}
            </View>

                <Text style={{ fontSize: 30 }}>
                    {userProfile ? userProfile.name : ""}
                </Text>
                <View style={{ marginTop: 20 }}>
                    <Text style={{ margin: 10 }}>
                        Email: {userProfile ? userProfile.email : ""}
                    </Text>
                    <Text style={{ margin: 10 }}>
                        Phone: {userProfile ? userProfile.phone : ""}
                    </Text>    
                </View>
                <EasyButton
                    large
                    registerbutton
                    onPress={() => navigation.navigate("Update Profile")}
                ><Text style={{ color: "white" }}>Edit Profile</Text>
                </EasyButton>
                <View style={{ marginTop: 80 }}>
                    <Button title={"Sign Out"} onPress={() => [
                        AsyncStorage.removeItem("jwt"),
                        logoutUser(context.dispatch)
                    ]} />
            
                    <View style={styles.order}>
                        <Text style={{ fontSize: 20 }}>My Orders</Text>
                        <View>
                            {orders ? (
                                orders.map((order) => {
                                    return <OrderCard key={order.id} item={order} select="false" />;
                                })
                            ) : (
                                <View style={styles.order}>
                                    <Text>You have no orders</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

            </ScrollView>
      
        </Center>
    )
}

const styles = StyleSheet.create({
    container: {
        width: width,
        marginTop: 0,
        backgroundColor: "white",  
        alignItems: "center"
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderStyle: "solid",
        borderWidth: 8,
        marginTop:10,
        padding: 0,
        justifyContent: "center",
        borderRadius: 100,
        borderColor: "#f54284",
        elevation: 10
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 100
    },
    subContainer: {
        alignItems: "center",
        marginTop: 60
    },
    order: {
        marginTop: 20,
        alignItems: "center",
        marginBottom: 60
    },
    updateProfileButton: {
        fontSize: 18,
        color: 'blue',
        marginTop: 10,
        textDecorationLine: 'underline',
        textAlign: 'center',
    }
})

export default UserProfile

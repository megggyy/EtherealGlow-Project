import React, { useState } from 'react'
import { View, StyleSheet, Dimensions, ScrollView, Button } from "react-native";
import { Text, HStack, VStack, Avatar, Spacer, Center } from "native-base";
import { clearCart } from "../../../Redux/Actions/cartActions";
import Icon from 'react-native-vector-icons/FontAwesome'
import Toast from "react-native-toast-message";
import axios from "axios";
import baseURL from "../../../assets/common/baseurl";
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux'
import AsyncStorage from "@react-native-async-storage/async-storage"


var { width, height } = Dimensions.get("window");

const Confirm = (props) => {
    const [token, setToken] = useState();
    // const confirm = props.route.params;
    const finalOrder = props.route.params;
    console.log("order", finalOrder)
    const dispatch = useDispatch()
    let navigation = useNavigation()

    const confirmOrder = () => {
        const order = finalOrder.order.order;

        // AsyncStorage.getItem("jwt")
        //     .then((res) => {
        //         setToken(res)
        //     })
        //     .catch((error) => console.log(error))
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        axios
            .post(`${baseURL}orders`, order, config)
            .then((res) => {
                if (res.status == 200 || res.status == 201) {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "Order Completed",
                        text2: "",
                    });
                    // dispatch(actions.clearCart())
                    // props.navigation.navigate("Cart")

                    setTimeout(() => {
                        dispatch(clearCart())
                        navigation.navigate("Cart");
                    }, 500);
                }
            })
            .catch((error) => {
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "Something went wrong",
                    text2: "Please try again",
                });
            });
    }

    
    return (
        <Center>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={{ fontSize: 30, fontWeight: "bold", paddingTop: 20 }}>Confirm Order</Text>
                    {props.route.params ? (
                        <View>
                            <Text style={styles.title}>Shipping to:</Text>
                            <View style={{ padding: 16 }}>
                                <Text style={{ fontSize: 20 }}>Address: {finalOrder.order.order.shippingDetails.address}</Text>
                                <Text style={{ fontSize: 20 }}>City: {finalOrder.order.order.shippingDetails.city}</Text>
                                <Text style={{ fontSize: 20 }}>Zip Code: {finalOrder.order.order.shippingDetails.postalCode}</Text>
                                <Text style={{ fontSize: 20 }}>Country: {finalOrder.order.order.shippingDetails.country}</Text> 
                            </View>
                            <Text style={styles.title}>Order Items</Text>

                            {finalOrder.order.order.orderItems.map((item) => {
                                return (
                                    <HStack space={[2, 3]} justifyContent="space-between" key={item.id}>
                                          <Avatar 
                                            size="68px" 
                                            source={{
                                                uri: item.image && Array.isArray(item.image) && item.image.length > 0 ?
                                                    item.image[0].url : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                                            }} 
                                        />
                                        <VStack>
                                            <Text _dark={{
                                                color: "warmGray.50"
                                            }} color="coolGray.800" bold>
                                                {item.name}
                                            </Text>

                                        </VStack>
                                        <Spacer />
                                        <Text fontSize="xs" _dark={{
                                            color: "warmGray.50"
                                        }} color="coolGray.800" alignSelf="flex-start">
                                            {item.quantity}
                                        </Text>
                                        <Spacer />
                                        <Text fontSize="xs" _dark={{
                                            color: "warmGray.50"
                                        }} color="coolGray.800" alignSelf="flex-start">
                                            {item.price * item.quantity}
                                        </Text>
                                    </HStack>
                                )
                            })}
                        </View>
                    ) : null}
                    <View style={{ alignItems: "center", margin: 20 }}>
                        <Button
                            title={"Place order"}
                            onPress={confirmOrder}
                        />
                    </View>
                </View>
            </ScrollView>
        </Center>
    )

}
const styles = StyleSheet.create({
    container: {
        height: height,
        width: width,
        alignContent: "center",
        backgroundColor: "white",  
    },
    titleContainer: {
        justifyContent: "center",
        alignItems: "center",
        margin: 16,
        borderWidth: 5, 
        borderColor: "pink"
    },
    title: {
        alignSelf: "center",
        margin: 8,
        fontSize: 22,
        fontWeight: "bold",
    },
    listItem: {
        alignItems: "center",
        backgroundColor: "white",
        justifyContent: "center",
        width: width / 1.2,
    },
    body: {
        margin: 10,
        alignItems: "center",
        flexDirection: "row",
    },
});
export default Confirm;
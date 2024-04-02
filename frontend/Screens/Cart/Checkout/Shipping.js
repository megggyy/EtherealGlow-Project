import React, { useEffect, useState, useContext } from 'react'
import { Text, View, Button, SafeAreaView } from 'react-native'
import { Select, Item, Picker, Toast } from 'native-base'
import Icon from 'react-native-vector-icons/FontAwesome'
import FormContainer from '../../../Shared/Form/FormContainer'
import Input from '../../../Shared/Form/Input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import AuthGlobal from "../../../Context/Store/AuthGlobal"
import { setShippingDetails } from '../../../Redux/Actions/shippingActions'; 

const countries = require("../../../assets/data/countries.json");
import SelectDropdown from 'react-native-select-dropdown'

const Checkout = (props) => {
    const [user, setUser] = useState('')
    const [orderItems, setOrderItems] = useState([])
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [country, setCountry] = useState('Philippines')
    const [phoneNo, setPhoneNo] = useState('')

    const dispatch = useDispatch()
    const shippingDetails = useSelector(state => state.shippingDetails)
    const navigation = useNavigation()
    const cartItems = useSelector(state => state.cartItems)
  
    const context = useContext(AuthGlobal);

    var totalPrice = 0;
    console.log("cart", cartItems)
    cartItems.forEach(cart => {
        totalPrice += cart.price * cart.quantity;
    });

    useEffect(() => {
        setOrderItems(cartItems)
        if(context.stateUser.isAuthenticated) {
            setUser(context.stateUser.user.userId)
        } else {
            navigation.navigate("User",{ screen: 'Login' });
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Please Login to Checkout",
                text2: ""
            });
        }
        return () => {
            setOrderItems();
        }
    }, [])

    const checkOut = () => {       
        const shippingDetails = { address, city, phoneNo, postalCode, country };
        dispatch(setShippingDetails(shippingDetails)); 
        console.log("orders", orderItems)
        let order = {
            shippingDetails,
            orderItems,
            dateOrdered: Date.now(),
            status: "3",
            totalPrice,
            user,
        }
        console.log("ship", order)
        navigation.navigate("Payment", { order: order })
    }

    console.log(orderItems)

    return (

        <KeyboardAwareScrollView
        viewIsInsideTabBar={true}
        extraHeight={200}
        enableOnAndroid={true}
    >
            <FormContainer title={"Shipping Address"}>
                <Input
                    placeholder={"Phone"}
                    name={"phoneNo"}
                    value={phoneNo}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setPhoneNo(text)}
                />
                <Input
                    placeholder={"Shipping Address 1"}
                    name={"ShippingAddress1"}
                    value={address}
                    onChangeText={(text) => setAddress(text)}
                />
                <Input
                    placeholder={"City"}
                    name={"city"}
                    value={city}
                    onChangeText={(text) => setCity(text)}
                />
                <Input
                    placeholder={"Zip Code"}
                    name={"postalCode"}
                    value={postalCode}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setPostalCode(text)}
                />
                {/* <Select
                    width="80%"
                    iosIcon={<Icon name="arrow-down" color={"#007aff"} />}
                    style={{ width: undefined }}
                    selectedValue={country}
                    placeholder="Select your country"
                    placeholderStyle={{ color: '#007aff' }}
                    placeholderIconColor="#007aff"
                    onValueChange={(e) => setCountry(e)}

                >
                    {countries.map((c) => {
                        return <Select.Item
                            key={c.code}
                            label={c.name}
                            value={c.name}
                        />
                    })}
                </Select> */}
               
                <View style={{ width: '80%', alignItems: "center" }}>
                    <Button title="Confirm" onPress={() => checkOut()} />
                </View>
            </FormContainer>
        </KeyboardAwareScrollView>

    )
}
export default Checkout;
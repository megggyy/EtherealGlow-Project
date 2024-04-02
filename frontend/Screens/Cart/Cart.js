import React, {useContext} from 'react'
import { Text, View, TouchableHighlight, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { Box, VStack, HStack, Button, Avatar, Spacer, } from 'native-base';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome";
import { SwipeListView } from 'react-native-swipe-list-view';
import { UPDATE_CART } from '../../Redux/constants';
import { removeFromCart, clearCart } from '../../Redux/Actions/cartActions'
var { height, width } = Dimensions.get("window");
import EasyButton from "../../Shared/StyledComponents/EasyButton"
import AuthGlobal from "../../Context/Store/AuthGlobal"


const Cart = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const cartItems = useSelector(state => state.cartItems)
    
    const context = useContext(AuthGlobal)
    var totalPrice = 0;
    console.log("cart", cartItems)
    cartItems.forEach(cart => {
        totalPrice += cart.price * cart.quantity;
    });

    const renderItem = ({ item, index }) => {
        const getFirstImage = () => {
            if (Array.isArray(item.image) && item.image.length > 0) {
                return item.image[0].url;
            }
            return 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
        };
        return (
            <Box pl="4" pr="5" py="2" bg="white" keyExtractor={item => item.product}>
                <HStack alignItems="center" space={3}>
                    <Avatar size="48px" source={{ uri: getFirstImage() }} />
                    <VStack flex={1} space={2}>
                        <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50' }} alignSelf="flex-end">
                            $ {item.price * item.quantity}
                        </Text>
                    </VStack>
                    <HStack space={2} alignItems="center">
                        <TouchableOpacity onPress={() => handleQuantityChange(dispatch, cartItems, item, 'decrease')}>
                            <Icon name="minus" size={20} />
                        </TouchableOpacity>
                        <Text>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleQuantityChange(dispatch, cartItems, item, 'increase')}>
                            <Icon name="plus" size={20} />
                        </TouchableOpacity>
                    </HStack>
                </HStack>
            </Box>
        );
    };

    const handleQuantityChange = (dispatch, cartItems, item, action) => {
        // Find the index of the item in the cart
        const itemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
        // Create a copy of the cart items array to avoid mutating the original state
        const updatedCartItems = [...cartItems];
    
        // If the item is found in the cart
        if (itemIndex !== -1) {
            // If action is 'increase', increase the quantity by 1
            if (action === 'increase') {
                updatedCartItems[itemIndex].quantity += 1;
            }
            // If action is 'decrease' and quantity is greater than 1, decrease the quantity by 1
            else if (action === 'decrease' && updatedCartItems[itemIndex].quantity > 1) {
                updatedCartItems[itemIndex].quantity -= 1;
            }
    
            // Dispatch an action to update the cart with the updated cart items
            dispatch({ type: UPDATE_CART, payload: updatedCartItems });
        } else {
            // If the item is not found in the cart, add it to the cart with product ID
            const newItem = {
                ...item,
                id: item.product._id, // Assuming the product ID is stored in "_id"
                quantity: 1 // Assuming the default quantity is 1
            };
            dispatch({ type: ADD_TO_CART, payload: newItem }); // Dispatch action to add to cart
        }
    };
    
    const renderHiddenItem = (cartItems) =>
        <TouchableOpacity
            onPress={() => dispatch(removeFromCart(cartItems.item))}
        >
            <VStack alignItems="center" style={styles.hiddenButton} >
                <View >
                    <Icon name="trash" color={"white"} size={30} bg="red" />
                    <Text color="white" fontSize="xs" fontWeight="medium">
                        Delete
                    </Text>
                </View>
            </VStack>

        </TouchableOpacity>;
  return (
    <>
        {cartItems.length > 0 ? (
            <Box bg="white" safeArea flex="1" width="100%">
                <SwipeListView
                    data={cartItems}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
                    disableRightSwipe={true}
                    leftOpenValue={75}
                    rightOpenValue={-150}
                    previewOpenValue={-100}
                    previewOpenDelay={3000}
                    keyExtractor={item => item._id.$oid}
                />
            </Box>
        ) : (
            <Box style={styles.emptyContainer}>
                <Text>No items in cart</Text>
            </Box>
        )}
        <VStack style={styles.bottomContainer} w='100%' justifyContent='space-between'>
            <HStack justifyContent="space-between" style={styles.priceContainer}>
                <Text style={styles.price}>Total: $ {totalPrice.toFixed(2)}</Text>
            </HStack>
            <HStack justifyContent="space-between" style={styles.buttonContainer}>
                <EasyButton
                    danger
                    medium
                    onPress={() => dispatch(clearCart())}
                >
                    <Text style={{ color: 'white' }}>Clear Cart</Text>
                </EasyButton>
                {context.stateUser.isAuthenticated ? (
                    <EasyButton
                        primary
                        medium
                        onPress={() => navigation.navigate('Checkout')}
                    >
                        <Text style={{ color: 'white' }}>Checkout</Text>
                    </EasyButton>
                ) : (
                    <EasyButton
                        secondary
                        medium
                        onPress={() => navigation.navigate("User", {screen: 'Login'})}
                    >
                        <Text style={{ color: 'white' }}>Login</Text>
                    </EasyButton>
                )}
            </HStack>
        </VStack>
    </>
);
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'white',
        elevation: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    priceContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
        marginBottom: 10,
    },
    price: {
        fontSize: 18,
        color: 'red'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});


export default Cart;
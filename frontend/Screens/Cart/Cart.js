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
            <TouchableHighlight
                _dark={{
                    bg: 'coolGray.800'
                }}
                _light={{
                    bg: 'white'
                }}
            >
                <Box pl="4" pr="5" py="2" bg="white" keyExtractor={item => item.product}>
                    <HStack alignItems="center" space={3}>
                        <Avatar size="48px" source={{ uri: getFirstImage() }} />
                        <VStack>
                            <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold>
                                {item.name}
                            </Text>
                        </VStack>
                        <HStack space={2}>
                        <TouchableOpacity onPress={() => handleQuantityChange(dispatch, cartItems, item, 'decrease')}>
                            <Icon name="minus" size={20} />
                        </TouchableOpacity>
                        <Text>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleQuantityChange(dispatch, cartItems, item, 'increase')}>
                            <Icon name="plus" size={20} />
                        </TouchableOpacity>
                    </HStack>
                    <Text fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50' }} alignSelf="flex-start">
                        $ {item.price * item.quantity}
                    </Text>
                </HStack>
            </Box>
        </TouchableHighlight>
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
                <Box bg="white" safeArea flex="1" width="100%" >
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
                    <Text >No items in cart
                    </Text>
                </Box>
            )}
            <VStack style={styles.bottomContainer} w='100%' justifyContent='space-between'
            >
                <HStack justifyContent="space-between">
                    <Text style={styles.price}>$ {totalPrice.toFixed(2)}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                    {/* <Button alignItems="center" onPress={() => dispatch(clearCart())} >Clear</Button> */}
                    <EasyButton
                        danger
                        medium
                        alignItems="center"
                        onPress={() => dispatch(clearCart())}
                    >
                        <Text style={{ color: 'white' }}>Clear</Text>
                    </EasyButton>
                </HStack>
              
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
            </VStack >
        </>
    )
}

const styles = StyleSheet.create({
    emptyContainer: {
        height: height,
        alignItems: "center",
        justifyContent: "center",
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'white',
        elevation: 20
    },
    price: {
        fontSize: 18,
        margin: 20,
        color: 'red'
    },
    hiddenContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        // width: 'lg'
    },
    hiddenButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 25,
        height: 70,
        width: width / 1.2
    }
});

export default Cart
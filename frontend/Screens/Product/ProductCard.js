import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    Text,
    Button
} from 'react-native';
import { addToCart } from '../../Redux/Actions/cartActions';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import EasyButton from "../../Shared/StyledComponents/EasyButton";
var { width } = Dimensions.get("window");

const ProductCard = (props) => {
    const { name, price, image, countInStock } = props;
    const dispatch = useDispatch();

    // Function to get the first image URL from the array
    const getFirstImage = () => {
        if (Array.isArray(image) && image.length > 0) {
            return image[0].url;
        }
        return 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.image}
                resizeMode="contain"
                source={{
                    uri: getFirstImage() 
                }}
            />
            
            <View style={styles.card} />
            <Text style={styles.title}>
                {(name.length && name.length > 15) ? name.substring(0, 15 - 3)
                    + '...' : name
                }
            </Text>
            <Text style={styles.price}>${price}</Text>

            {countInStock > 0 ? (
                <View style={{ marginBottom: 60 }}>
                <EasyButton
                    large
                    registerbutton
                    onPress={() => {
                        dispatch(addToCart({ ...props, quantity: 1, })),
                            Toast.show({
                                topOffset: 60,
                                type: "success",
                                text1: `${name} added to Cart`,
                                text2: "Go to your cart to complete order"
                            })
                    }}
                ><Text style={{ color: "white" }}>Add to Cart</Text>
                </EasyButton>
                    {/* <Button
                        title={'Add'}
                        color={'pink'}
                        onPress={() => {
                            dispatch(addToCart({ ...props, quantity: 1, })),
                                Toast.show({
                                    topOffset: 60,
                                    type: "success",
                                    text1: `${name} added to Cart`,
                                    text2: "Go to your cart to complete order"
                                })
                        }}
                    >
                    </Button> */}
                </View>
            ) : <Text style={{ marginTop: 20 }}>Currently Unavailable</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width / 2 - 20,
        height: width / 1.7,
        padding: 10,
        borderRadius: 10,
        marginTop: 55,
        marginBottom: 5,
        marginLeft: 10,
        alignItems: 'center',
        elevation: 8,
        backgroundColor: 'white'
    },
    image: {
        width: width / 2 - 20 - 10,
        height: width / 2 - 20 - 30,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: -45
    },
    card: {
        marginBottom: 10,
        height: width / 2 - 20 - 90,
        backgroundColor: 'transparent',
        width: width / 2 - 20 - 10
    },
    title: {
        fontWeight: "bold",
        fontSize: 14,
        textAlign: 'center'
    },
    price: {
        fontSize: 20,
        color: '#de0d5a',
        marginTop: 10
    }
});

export default ProductCard;

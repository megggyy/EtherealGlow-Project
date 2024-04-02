import React from 'react';
import { StyleSheet, View, Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { addToCart } from '../../Redux/Actions/cartActions';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
var { width } = Dimensions.get("window");

const ProductCard = (props) => {
    const { name, price, image, countInStock } = props;
    const dispatch = useDispatch();

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
                resizeMode="cover"
                source={{ uri: getFirstImage() }}
            />
            <View style={styles.content}>
                <Text style={styles.title}>
                    {name.length > 15 ? name.substring(0, 15 - 3) + '...' : name}
                </Text>
                <Text style={styles.price}>${price}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        dispatch(addToCart({ ...props, quantity: 1 }));
                        Toast.show({
                            topOffset: 60,
                            type: "success",
                            text1: `${name} added to Cart`,
                            text2: "Go to your cart to complete order"
                        });
                    }}
                    disabled={countInStock === 0}
                >
                    <Text style={styles.buttonText}>{countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width / 2 - 20,
        height: width / 1.5,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        elevation: 8,
        backgroundColor: 'white'
    },
    image: {
        width: '90%',
        height: '55%',
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 10,
        marginRight: 5,
        borderRadius: 10,
    },
    content: {
        padding: 10,
        alignItems: 'center',
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
    },
    price: {
        fontSize: 16,
        color: '#AA336A',
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: 'pink',
        borderColor: 'black',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default ProductCard;
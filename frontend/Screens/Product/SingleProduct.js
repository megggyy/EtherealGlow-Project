import React, { useState, useEffect, useContext } from "react";
import {
  Image,
  View,
  StyleSheet,
  Text,
  ScrollView,
  Button,
} from "react-native";
import { Left, Right, Container, H1, Center, Heading } from "native-base";
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import TrafficLight from "../../Shared/StyledComponents/TrafficLight";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import AuthGlobal from "../../Context/Store/AuthGlobal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import baseURL from "../../assets/common/baseurl";

const SingleProduct = ({ route }) => {
  const context = useContext(AuthGlobal);

  const [item, setItem] = useState(route.params.item);
  // console.log(item)
  const [availability, setAvailability] = useState("");
  const [availabilityText, setAvailabilityText] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [isLogin, setIsLogin] = useState(false);
  const [token, setToken] = useState("");
  const [wishListOk, setWishListOk] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showMessage, setShowMessage] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  console.log("wish", wishListOk);
  const [wishlist, setWishlist] = useState(null);

  const getFirstImage = () => {
    if (Array.isArray(item.image) && item.image.length > 0) {
      return item.image[0].url;
    }
    return "https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png";
  };

  useEffect(() => {
    // retrieveToken();
    checkWishlist();
  }, []);

  // const retrieveToken = async () => {
  //   try {
  //     const jwt = await AsyncStorage.getItem("jwt");
  //     setToken(jwt);
  //   } catch (error) {
  //     console.error("Error retrieving token:", error);
  //   }
  // };

  // const config = {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // };

  const checkWishlist = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      console.log("JWT Token:", token);
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      };
      if (wishlist) {
        const response = await axios.get(`${baseURL}wishlist`, config);
        setWishlist(response.data);
        console.log(response);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const addToWishlist = async () => {
    try { 
        const token = await AsyncStorage.getItem("jwt");
        console.log("JWT Token:", token);
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        };
      const productId = item._id;
      const response = await axios.post(
        `http://172.20.10.4:4000/api/v1/users/wishlist/${context.stateUser.user.userId}`, { product: productId },  config )
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
              Toast.show({
                  topOffset: 60,
                  type: "success",
                  text1: "Product Added to Wishlist",
                  text2: ""
              });
              setTimeout(() => {
                  navigation.navigate("Products");
              }, 500);
          }
      })
      console.log(response.data.product)
      if (response.data.success) {
        setWishlist(response.data.product);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromWishlist = async () => {
    try {
      const productId = item._id;
      await axios.delete(`${baseURL}wishlist/${productId}`, config);
      setWishlist(null);
    } catch (error) {
      console.error(error);
    }
  };

  const wishlistHandler = async () => {
    // if (!token) {
    //   navLogin();
    //   return;
    // }

    if (wishlist) {
      removeFromWishlist();
    } else {
      addToWishlist();
    }
  };

  useEffect(() => {
    if (item.countInStock === 0) {
      setAvailability(<TrafficLight unavailable></TrafficLight>);
      setAvailabilityText("Unavailable");
    } else if (item.countInStock <= 5) {
      setAvailability(<TrafficLight limited></TrafficLight>);
      setAvailabilityText("Limited Stock");
    } else {
      setAvailability(<TrafficLight available></TrafficLight>);
      setAvailabilityText("Available");
    }

    return () => {
      setAvailability(null);
      setAvailabilityText("");
    };
  }, []);
  return (
    <Center flexGrow={1}>
      <ScrollView style={{ marginBottom: 80, padding: 5 }}>
        <View>
          <Image
            source={{
              uri: getFirstImage(),
            }}
            resizeMode="contain"
            style={styles.image}
          />
        </View>
        <View style={styles.contentContainer}>
          <Heading style={styles.contentHeader} size="xl">
            {item.name}
          </Heading>
          <Text style={styles.contentText}>{item.brand}</Text>
        </View>
        <View style={styles.availabilityContainer}>
          <View style={styles.availability}>
            <Text style={{ marginRight: 10 }}>
              Availability: {availabilityText}
            </Text>
            {availability}
          </View>
          <Text>{item.description}</Text>
        </View>
        <EasyButton primary medium>
          <Text style={{ color: "white" }}> Add</Text>
        </EasyButton>
        {/* {wishListOk === true ? (
          <TouchableOpacity
            onPress={() => {
              deleteWishlist();
            }}
          >
            <Ionicons name="heart" style={{ fontSize: 30, color: "red" }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              addWishlist();
            }}
          >
            <Ionicons name="heart-outline" style={{ fontSize: 30 }} />
          </TouchableOpacity>
        )} */}

        <TouchableOpacity
          style={styles.heartIconContainer}
          onPress={wishlistHandler}
        >
          <Ionicons
            name={wishlist ? "heart" : "heart-outline"}
            size={30}
            color={wishlist ? "red" : "black"}
          />
        </TouchableOpacity>
        {showMessage && (
          <View
            style={{
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: 5,
              padding: 35,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 30,
              marginRight: 30,
              left: 0,
              right: 0,
              transform: [{ translateY: -25 }],
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Item added to wishlist
            </Text>
          </View>
        )}
        {showDelete && (
          <View
            style={{
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: 5,
              padding: 35,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 30,
              marginRight: 30,
              left: 0,
              right: 0,
              transform: [{ translateY: -25 }],
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Item Remove to wishlist
            </Text>
          </View>
        )}
      </ScrollView>
    </Center>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: "100%",
  },
  imageContainer: {
    backgroundColor: "white",
    padding: 0,
    margin: 0,
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
  contentContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  contentHeader: {
    fontWeight: "bold",
    marginBottom: 20,
  },
  contentText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  bottomContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "white",
  },
  price: {
    fontSize: 24,
    margin: 20,
    color: "red",
  },
  availabilityContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  availability: {
    flexDirection: "row",
    marginBottom: 10,
  },
  heartIconContainer: {
    alignItems: "flex-end", // Changed from "right" to "flex-end"
    marginTop: 20,
  },
});

export default SingleProduct;

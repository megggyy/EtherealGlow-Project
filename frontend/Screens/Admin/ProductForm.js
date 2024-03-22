import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform
} from "react-native"
import { Item, Picker, Select, Box } from "native-base"
import FormContainer from "../../Shared/Form/FormContainer"
import Input from "../../Shared/Form/Input"
import EasyButton from "../../Shared/StyledComponents/EasyButton"

import Icon from "react-native-vector-icons/FontAwesome"
import Toast from "react-native-toast-message"
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from "../../assets/common/baseurl"
import Error from "../../Shared/Error"
import axios from "axios"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator";
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import mime from "mime";


const ProductForm = (props) => {
    // console.log(props.route.params)
    const [pickerValue, setPickerValue] = useState('');
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    // const [image, setImage] = useState('');
    // const [mainImage, setMainImage] = useState();

    const [selectedImages, setSelectedImages] = useState([]);

    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [token, setToken] = useState();
    const [error, setError] = useState();
    const [countInStock, setCountInStock] = useState();
    const [rating, setRating] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);
    const [richDescription, setRichDescription] = useState();
    const [numReviews, setNumReviews] = useState(0);
    const [item, setItem] = useState(null);

    let navigation = useNavigation()

    useEffect(() => {
        if (!props.route.params) {
            setItem(null);
        } else {
            setItem(props.route.params.item);
            setBrand(props.route.params.item.brand);
            setName(props.route.params.item.name);
            setPrice(props.route.params.item.price.toString());
            setDescription(props.route.params.item.description);
            setSelectedImages(props.route.params.item.image);
            setCategory(props.route.params.item.category._id);
            setPickerValue(props.route.params.item.category._id);
            setCountInStock(props.route.params.item.countInStock.toString());
        }
        AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res)
            })
            .catch((error) => console.log(error))
        axios
            .get(`${baseURL}categories`)
            .then((res) => setCategories(res.data))
            .catch((error) => alert("Error  load categories"));
        (async () => {
            if (Platform.OS !== "web") {
                const {
                    status,
                } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!")
                }
            }
        })();
        return () => {
            setCategories([])
        }
    }, [])

    const pickImage = async () => {
        // let result = await ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.All,
        //     allowsEditing: true,
        //     aspect: [4, 3],
        //     quality: 1
        // });

        // if (!result.canceled) {
        //     console.log(result)
        //     setMainImage(result.assets[0].uri);
        //     setImage(result.assets[0].uri);
        // }
        let results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [3, 2],
            quality: 1,
            allowsMultipleSelection: true,
          });
      
          if (!results.canceled) {
            const selectedAssets = results.assets;
      
            const manipulatorOptions = {
              compress: 0.5,
              format: ImageManipulator.SaveFormat.JPEG,
            };
      
            const newImages = [];
      
            for (const selectedAsset of selectedAssets) {
              try {
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                  selectedAsset.uri,
                  [],
                  manipulatorOptions
                );
      
                if (manipulatedImage) {
                  newImages.push(manipulatedImage);
                }
              } catch (error) {
                Toast.show({
                  type: "error",
                  position: "top",
                  text1: "Error Adding Image",
                  text2: `${error}`,
                  visibilityTime: 3000,
                  autoHide: true,
                });
              }
            }
      
            setSelectedImages(newImages);
          }
    }
    

    const addProduct = () => {
        if (
            name === "" ||
            brand === "" ||
            price === "" ||
            description === "" ||
            category === "" ||
            countInStock === ""
        ) {
            setError("Please fill in the form correctly")
        }

        let formData = new FormData();
        //const newImageUri = "file:///" + image.split("file:/").join("");

        if (selectedImages.length > 0) {
            selectedImages.forEach((image, index) => {
              const imageName = image.uri.split("/").pop();
              const imageType = "image/" + imageName.split(".").pop();
    
              formData.append("image", {
                uri: image.uri,
                name: imageName,
                type: imageType,
              });
            });
          }

        formData.append("name", name);
        formData.append("brand", brand);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("countInStock", countInStock);
        formData.append("richDescription", richDescription);
        formData.append("rating", rating);
        formData.append("numReviews", numReviews);
        formData.append("isFeatured", isFeatured);
 

        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${token}`
            }
        }
        if (item !== null) {
            console.log(item)
            axios
                .put(`${baseURL}products/${item.id}`, formData, config)
                .then((res) => {
                    if (res.status === 200 || res.status === 201) {
                        Toast.show({
                            topOffset: 60,
                            type: "success",
                            text1: "Product successfuly updated",
                            text2: ""
                        });
                        setTimeout(() => {
                            navigation.navigate("Products");
                        }, 500)
                    }
                })
                .catch((error) => {
                    Toast.show({
                        topOffset: 60,
                        type: "error",
                        text1: "Something went wrong",
                        text2: "Please try again"
                    })
                })
        } else {
            axios
                .post(`${baseURL}products`, formData, config)
                .then((res) => {
                    if (res.status === 200 || res.status === 201) {
                        Toast.show({
                            topOffset: 60,
                            type: "success",
                            text1: "New Product added",
                            text2: ""
                        });
                        setTimeout(() => {
                            navigation.navigate("Products");
                        }, 500)
                    }
                })
                .catch((error) => {
                    console.log(error)
                    Toast.show({
                        topOffset: 60,
                        type: "error",
                        text1: "Something went wrong",
                        text2: "Please try again"
                    })
                })

        }

    }

    
    return (
        <FormContainer title="Add Product">
          <View style={styles.imageContainer}>
                {selectedImages?.map((image, index) => (
                    <View style={styles.imageWrapper} key={index}>
                        <Image
                            style={styles.image}
                            source={{ uri: image.uri }}
                        />
                    </View>
                ))}
                   {selectedImages?.length > 0 ? (
                      <Text
                      
                      >
                         {selectedImages.length} image
                        {selectedImages.length > 1 ? "s" : ""}
                      </Text>
                    ) : (
                      <Text
                      
                      >
                        No Image
                      </Text>
                    )}
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    <Icon style={{ color: "white" }} name="camera" />
                </TouchableOpacity>
            </View>

            {/* PREVIOUS IMAGE CODE */}
            {/* <View style={styles.imageContainer}>
                {selectedImages?.map((image, index) => (
                    <Image
                        key={index}
                        style={styles.image}
                        source={{ uri: image.uri }}
                    />
                ))}
                <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imagePicker}>
                    <Icon style={{ color: "white" }} name="camera" />
                </TouchableOpacity>
                {selectedImages?.length > 0 ? (
                      <Text
                      
                      >
                        Add {selectedImages.length} image
                        {selectedImages.length > 1 ? "s" : ""}
                      </Text>
                    ) : (
                      <Text
                      
                      >
                        No Image
                      </Text>
                    )}
                    
            </View> */}
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Brand</Text>
            </View>
            <Input
                placeholder="Brand"
                name="brand"
                id="brand"
                value={brand}
                onChangeText={(text) => setBrand(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Name</Text>
            </View>
            <Input
                placeholder="Name"
                name="name"
                id="name"
                value={name}
                onChangeText={(text) => setName(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Price</Text>
            </View>
            <Input
                placeholder="Price"
                name="price"
                id="price"
                value={price}
                keyboardType={"numeric"}
                onChangeText={(text) => setPrice(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Count in Stock</Text>
            </View>
            <Input
                placeholder="Stock"
                name="stock"
                id="stock"
                value={countInStock}
                keyboardType={"numeric"}
                onChangeText={(text) => setCountInStock(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Description</Text>
            </View>
            <Input
                placeholder="Description"
                name="description"
                id="description"
                value={description}
                onChangeText={(text) => setDescription(text)}
            />
            <Box>
                <Select
                    minWidth="90%" placeholder="Select your Category"
                    selectedValue={pickerValue}
                    onValueChange={(e) => [setPickerValue(e), setCategory(e)]}
                >
                    {categories.map((c, index) => {
                        return (
                            <Select.Item
                                key={c.id}
                                label={c.name}
                                value={c.id} />
                        )
                    })}

                </Select>
            </Box>

            {error ? <Error message={error} /> : null}
            <View style={styles.buttonContainer}>
                <EasyButton
                    large
                    primary
                    onPress={() => addProduct()}
                ><Text style={styles.buttonText}>Confirm</Text>
                </EasyButton>
            </View>
            
        </FormContainer>
    )
}


const styles = StyleSheet.create({
    label: {
        width: "80%",
        marginTop: 10
    },
    buttonContainer: {
        width: "80%",
        marginBottom: 80,
        marginTop: 20,
        alignItems: "center"
    },
    buttonText: {
        color: "white"
    },
    imageContainer: {
        flexDirection: 'row', // Arrange children in a row
        flexWrap: 'wrap', // Allow wrapping
        width: 200,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#E0E0E0",
        elevation: 10
    },
    imageWrapper: {
        width: '50%', // Each image wrapper takes up half the container's width
        height: '50%', // and half the container's height
        padding: 4, // Optional: Adjust padding to create space between images
    },
    image: {
        width: '100%', // Make image fill the wrapper
        height: '100%', // Adjust height accordingly
        resizeMode: 'cover', // Cover the whole area of the wrapper, you might want to adjust this
    },
    imagePicker: {
        position: "absolute",
        right: 5,
        bottom: 5,
        backgroundColor: "grey",
        padding: 8,
        borderRadius: 100,
        elevation: 20
    },
})


export default ProductForm;
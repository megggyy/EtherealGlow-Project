import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform
} from "react-native"
import FormContainer from "../../Shared/Form/FormContainer"
import Input from "../../Shared/Form/Input"
import EasyButton from "../../Shared/StyledComponents/EasyButton"
import AsyncStorage from '@react-native-async-storage/async-storage'
import baseURL from "../../assets/common/baseurl"
import Error from "../../Shared/Error"
import axios from "axios"
import Toast from "react-native-toast-message"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/FontAwesome"
import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator";

const CategoryForm = (props) => {
    const [categoryName, setCategoryName] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [item, setItem] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (props.route.params && props.route.params.item) {
            setCategoryName(props.route.params.item.name);
            setDescription(props.route.params.item.description);
            setSelectedImages(props.route.params.item.image);
        }
        AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res);
            })
            .catch((error) => console.log(error));
    }, [props.route.params])

    const pickImage = async () => {
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

    // const editCategory = () => {
    //     const category = {
    //         name: categoryName,
    //         description: description
    //     };

    //     const config = {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     };

    //     axios
    //         .put(`${baseURL}categories/${props.route.params.item.id}`, category, config)
    //         .then((res) => {
    //             if (res.status === 200 || res.status === 201) {
    //                 Toast.show({
    //                     topOffset: 60,
    //                     type: "success",
    //                     text1: "Category updated successfully",
    //                     text2: ""
    //                 });
    //                 setTimeout(() => {
    //                     navigation.navigate("Categories");
    //                 }, 500)
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(error)
    //             Toast.show({
    //                 topOffset: 60,
    //                 type: "error",
    //                 text1: "Something went wrong",
    //                 text2: "Please try again"
    //             })
    //         })
    // }

    const editCategory = () => {
        if (
            categoryName === "" || 
            description === ""
            ) {
            setError("Please fill in the form correctly");
          
        }
    
        let formData = new FormData();
    
        // Add images to formData if selectedImages exists
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
    
        // Append other category information to formData
        formData.append("name", categoryName);
        formData.append("description", description);
    
        const config = {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            }
        };
    
        axios
        .put(`${baseURL}categories/${props.route.params.item.id}`, formData, config)
            .then((res) => {
                if (res.status === 200 || res.status === 201) {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "Category updated successfully",
                        text2: ""
                    });
                    setTimeout(() => {
                        navigation.navigate("Categories");
                    }, 500);
                }
            })
            .catch((error) => {
                console.log(error);
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "Something went wrong",
                    text2: "Please try again"
                });
            });
    }; 

    return (
        <FormContainer title="Edit Category">
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
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Name</Text>
            </View>
            <Input
                placeholder="Name"
                name="name"
                id="name"
                value={categoryName}
                onChangeText={(text) => setCategoryName(text)}
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
            {error ? <Error message={error} /> : null}
            <View style={styles.buttonContainer}>
                <EasyButton
                    large
                    primary
                    onPress={() => editCategory()}
                >
                    <Text style={styles.buttonText}>Save Changes</Text>
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

export default CategoryForm;

import React, { Component, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native'; // Import Modal
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Camera } from 'expo-camera';
import mime from 'mime';
import axios from 'axios';
import baseURL from "../../assets/common/baseurl";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Input from "../../Shared/Form/Input";
import TitleContainer from '../../Shared/Form/TitleContainer';
import { Button, Center, Image, useSafeArea } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import AuthGlobal from '../../Context/Store/AuthGlobal'
import AsyncStorage from '@react-native-async-storage/async-storage';

var { height, width } = Dimensions.get("window")

const UserEdit = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState(null);
    const [camera, setCamera] = useState('')
    const [mainImage, setMainImage] = useState()
    const [hasCameraPermission, setHasCameraPermission] = useState(null)
    const [error, setError] = useState('')
    const [imagesPreview, setImagesPreview] = useState([])
    const [launchCam, setLaunchCam] =  useState(false)
    const [type, setType] = useState(Camera.Constants.Type.back)
    const [modalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState()
    const navigation = useNavigation()
    const context = useContext(AuthGlobal)

    useEffect(() => {
      const fetchData = async () => {
          try {
              const token = await AsyncStorage.getItem("jwt");
              setToken(token);
              const response = await axios.get(`${baseURL}users/${context.stateUser.user.userId}`, {
                  headers: { Authorization: `Bearer ${token}` },
              });
              const userData = response.data;
              console.log("User Data:", userData); // Log user data here
              setName(userData.name);
              setEmail(userData.email);
              setImage(userData.image);
              setMainImage(userData.image); // Assuming you're fetching image URL
          } catch (error) {
              console.error("Error fetching user data:", error);
              // Handle error
          }
      };
  
      fetchData();
  }, []);

    AsyncStorage.getItem("jwt")
    .then((res) => {
        setToken(res)
    })

    // console.log(token)
    const userUpdate = () => {


        let formData = new FormData()
        formData.append("email", email)
        formData.append("name", name)
        if (image) {
            const newImageUri = "file:///" + image.split("file:/").join("");
            formData.append("image", {
                uri: newImageUri,
                type: mime.getType(newImageUri),
                name: newImageUri.split("/").pop()
            });
        }
        const config = {
            headers: {
                Accept: "multipart/form-data",
                "Content-Type": "multipart/form-data",
                'Authorization': `Bearer ${token}`

            }
        }
        console.log("FormData:", formData);
        axios
        .patch(`${baseURL}users/${context.stateUser.user.userId}`, formData, config)
        .then((res)=>{
            if (res.status === 200)
            {
                Toast.show({
                    topOffset: 60,
                    type: "success",
                    text1: "Update Profile Successful",
                    text2: "Please Login your account"
                })
                setTimeout(() => {
                    navigation.navigate("User Profile");
                }, 500);
            }
        })
        .catch((error) => {
            if (error.response && error.response.data) {
                console.log("Error from Update", error.response.data.error);

            } else {
                console.log("Error from Update", error.message);
            }
            Toast.show({
                position: "bottom",
                bottomOffset: 20,
                type: "error",
                text1: "Something went wrong",
                text2: "Please try again",
            });
        });

    }

    const addimage = async() => {
        setLaunchCam(false); 

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
            setMainImage(result.uri);
            setModalVisible(false);
        }  
    }

    const takePicture = async() => {
        setLaunchCam(true);

        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
            console.log('Camera permission not granted');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            aspect: [4, 3],
            quality: 0.1,
        });

        if (!result.canceled) {
            setImage(result.uri);
            setMainImage(result.uri);
        }
    }

    useEffect(() => {
        (async () => {
            const cameraStatus =  await Camera.requestCameraPermissionsAsync()
            setHasCameraPermission(cameraStatus.status === 'granted')
        })();
    })

    // console.log(context.stateUser.userProfile.name)

    return (
        <KeyboardAwareScrollView 
        viewIsInsideTabBar={true}
        extraHeight={200}
        enableOnAndroid={true}
        >
        <TitleContainer title="Register">
        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Choose an option to get a image:</Text>
                        <View style={styles.buttonRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                takePicture();
                            }}
                            title="Take Picture"
                            variant={"ghost"}
                        ><Ionicons name="camera-outline" style={{fontSize: 30}}/> 
                     </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                addimage();
                            }}
                            title="Add Image"
                            variant={"ghost"}
                        ><Ionicons name="image-outline" style={{fontSize: 30}}/> 
                         </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            title="Cancel"
                            variant={"ghost"}
                            style={{marginTop:5.5}}
                        ><Text>CANCEL</Text>
                         </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        <View style={styles.imageContainer}>
        <Image 
    style={styles.image} 
    source={{ uri: mainImage }} 
/>
            <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                style={styles.imagePicker}>
                <Ionicons name="camera-outline" style={{ color: "white" }}/>
            </TouchableOpacity>
        </View>
        <Input 
            placeholder={"Email"}
            name = {"email"}
            id = {"email"}
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}

        />
<Input 
    placeholder={"Name"}
    name={"name"}
    id={"name"}
    value={name}
    onChangeText={(text) => setName(text)} 
/>



        <View style={styles.buttonGroup}>
            {error ? <Error message={error} /> : null}
        </View>

        <View>
            <Button variant={"ghost"} onPress={() => userUpdate()}>
                <Text style={{ color: "blue" }}>Confirm</Text>
            </Button>
        </View>


        </TitleContainer>
        </KeyboardAwareScrollView>
    );
};


const styles = StyleSheet.create({
    buttonGroup: {
        width: "80%",
        margin: 10,
        alignItems: "center",
    },
    buttonContainer: {
        width: "80%",
        marginBottom: 80,
        marginTop: 20,
        alignItems: "center"
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderStyle: "solid",
        borderWidth: 8,
        padding: 0,
        justifyContent: "center",
        borderRadius: 100,
        borderColor: "#E0E0E0",
        elevation: 10
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 100
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
    cameraContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    fixedRatio: {
        flex: 1,
        aspectRatio: 1
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
});


export default UserEdit;
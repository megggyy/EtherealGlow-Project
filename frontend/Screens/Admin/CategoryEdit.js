import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
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

const CategoryForm = (props) => {
    const [categoryName, setCategoryName] = useState("");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

    useEffect(() => {
        if (props.route.params && props.route.params.item) {
            setCategoryName(props.route.params.item.name);
        }
        AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res);
            })
            .catch((error) => console.log(error));
    }, [props.route.params])

    const editCategory = () => {
        const category = {
            name: categoryName
        };

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        axios
            .put(`${baseURL}categories/${props.route.params.item.id}`, category, config)
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

    return (
        <FormContainer title="Edit Category">
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
})

export default CategoryForm;

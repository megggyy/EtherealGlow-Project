import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    RefreshControl,

} from "react-native";
import { Input, VStack, Heading, Box } from "native-base"
import Icon from "react-native-vector-icons/FontAwesome"
import { useFocusEffect } from "@react-navigation/native"
import { Searchbar } from 'react-native-paper';
import ListItem from "./ListCategory"

import axios from "axios"
import baseURL from "../../assets/common/baseurl"
import AsyncStorage from '@react-native-async-storage/async-storage'
var { height, width } = Dimensions.get("window")
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import { useNavigation } from "@react-navigation/native"


const Categories = (props) => {

    const [categoryList, setCategoryList] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation()
    const ListHeader = () => {
        return (
            <View style={styles.listHeader}>
                 <View style={styles.headerItem}></View>
                 <View style={styles.headerItem}></View>
            <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600' }}>Name</Text>
            </View>
            <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600' }}>Description</Text>
            </View>
        </View>
        )
    }
    const searchCategory = (text) => {
        if (text === "") {
            setCategoryFilter(categoryList)
        }
        setCategoryFilter(
            categoryList.filter((i) =>
                i.name.toLowerCase().includes(text.toLowerCase())
            )
        )
    }

    const deleteCategory = (id) => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };

        axios
            .delete(`${baseURL}categories/${id}`, config)
            .then((res) => {
                const newCategories = categoryFilter.filter((item) => item.id !== id);
                setCategoryFilter(newCategories);
            })
            .catch((error) => alert("Error delete categories"));
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            axios
                .get(`${baseURL}categories`)
                .then((res) => {
                    // console.log(res.data)
                    setCategoryList(res.data);
                    setCategoryFilter(res.data);
                    setLoading(false);
                })
            setRefreshing(false);
        }, 2000);
    }, []);
    useFocusEffect(
        useCallback(
            () => {
                // Get Token
                AsyncStorage.getItem("jwt")
                    .then((res) => {
                        setToken(res)
                    })
                    .catch((error) => console.log(error))
                axios
                    .get(`${baseURL}categories`)
                    .then((res) => {
                        console.log(res.data)
                        setCategoryList(res.data);
                        setCategoryFilter(res.data);
                        setLoading(false);
                    })

                return () => {
                    setCategoryList();
                    setCategoryFilter();
                    setLoading(true);
                }
            },
            [],
        )
    )
    return (
        <Box flex={1}>
            <View style={styles.buttonContainer}>
                <EasyButton
                    adminButton
                    medium
                    onPress={() => navigation.navigate("CategoryForm")}
                >
                    <Icon name="plus" size={18} color="white" />
                    <Text style={styles.buttonText}>Category</Text>
                </EasyButton>
            </View>
            <Searchbar width="80%"
                placeholder="Search"
                onChangeText={(text) => searchCategory(text)}
            //   value={searchQuery}
            />
            {loading ? (
                <View style={styles.spinner}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : (<FlatList
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={ListHeader}
                data={categoryFilter}
                renderItem={({ item, index }) => (
                    <ListItem
                        item={item}
                        index={index}
                        deleteCategory={deleteCategory}

                    />
                )}
                keyExtractor={(item) => item.id}
            />)}


        </Box>
    );
}

const styles = StyleSheet.create({
    listHeader: {
        flexDirection: 'row',
        padding: 5,
        backgroundColor: 'gainsboro'
    },
    headerItem: {
        margin: 3,
        width: width / 6
    },
    spinner: {
        height: height / 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        marginBottom: 160,
        backgroundColor: 'white'
    },
    buttonContainer: {
        margin: 20,
        alignSelf: 'center',
        flexDirection: 'row'
    },
    buttonText: {
        marginLeft: 4,
        color: 'white'
    }
})

export default Categories;
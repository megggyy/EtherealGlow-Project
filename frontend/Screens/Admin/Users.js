import React, { useState, useCallback } from "react";
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
import ListUser from "./ListUser"

import axios from "axios"
import baseURL from "../../assets/common/baseurl"
import AsyncStorage from '@react-native-async-storage/async-storage'
var { height, width } = Dimensions.get("window")
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import { useNavigation } from "@react-navigation/native"
const Users = (props) => {

    const [userList, setUserList] = useState([]);
    const [userFilter, setUserFilter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState();
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation()

    const ListHeader = () => {
        return (
            <View
                elevation={1}
                style={styles.listHeader}
            >
               
                <View style={styles.headerItem}>
                <Text style={{ fontWeight: '600' }}>Image</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Name</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Email</Text>
                </View>
                <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Phone</Text>
                </View>
                {/* <View style={styles.headerItem}>
                    <Text style={{ fontWeight: '600' }}>Price</Text>
                </View> */}
            </View>
        )
    }
    const searchUser = (text) => {
        if (text === "") {
            setUserFilter(userList)
        }
        setUserFilter(
            userList.filter((i) =>
                i.name.toLowerCase().includes(text.toLowerCase())
            )
        )
    }

    const deleteUser = (id) => {
        axios
            .delete(`${baseURL}users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const users = userFilter.filter((item) => item.id !== id)
                setUserFilter(users)
            })
            .catch((error) => console.log(error));
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            axios
                .get(`${baseURL}users`)
                .then((res) => {
                    // console.log(res.data)
                    setUserList(res.data);
                    setUserFilter(res.data);
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
                    .get(`${baseURL}users`)
                    .then((res) => {
                        console.log(res.data)
                        setUserList(res.data);
                        setUserFilter(res.data);
                        setLoading(false);
                    })

                return () => {
                    setUserList();
                    setUserFilter();
                    setLoading(true);
                }
            },
            [],
        )
    )
    return (
        <Box flex={1}>
            <Searchbar width="80%"
                placeholder="Search"
                onChangeText={(text) => searchUser(text)}
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
                data={userFilter}
                renderItem={({ item, index }) => (
                    <ListUser
                        item={item}
                        index={index}
                        deleteUser={deleteUser}

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
        margin: 1,
        width: width / 4
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

export default Users;
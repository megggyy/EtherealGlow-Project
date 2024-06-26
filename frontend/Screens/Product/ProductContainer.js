import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollViewComponent } from 'react-native'
import { Center, VStack, Input, Heading, Text, Icon, NativeBaseProvider, extendTheme, ScrollView, } from "native-base";
import { Ionicons, SmallCloseIcon } from "@expo/vector-icons";

import ProductList from "./ProductList";
import SearchedProduct from "./SearchedProduct";
import Banner from "../../Shared/Banner";
import CategoryFilter from "./CategoryFilter";
import axios from "axios";
import baseURL from "../../assets/common/baseurl";
// const data = require('../../assets/data/products.json')
// const productCategories = require('../../assets/data/categories.json')


var { width, height } = Dimensions.get("window")
const ProductContainer = () => {
    const [products, setProducts] = useState([])
    const [productsFiltered, setProductsFiltered] = useState([]);
    const [focus, setFocus] = useState();
    const [categories, setCategories] = useState([]);
    const [active, setActive] = useState([]);
    const [initialState, setInitialState] = useState([])
    const [productsCtg, setProductsCtg] = useState([])
    
    // useEffect(() => {
    //     setProducts(data);
    //     setProductsFiltered(data);
    //     setFocus(false);
    //     setCategories(productCategories)
    //     setActive(-1)
    //     setInitialState(data)
    //     setProductsCtg(data)
    //     return () => {
    //         setProducts([])
    //         setProductsFiltered([]);
    //         setFocus()
    //         setCategories([])
    //         setActive()
    //         setInitialState();
    //         setProductsCtg([])
    //     }
    // }, [])
    useFocusEffect((
        useCallback(
            () => {
                setFocus(false);
                setActive(-1);
                // Products
                axios
                    .get(`${baseURL}products`)
                    .then((res) => {
                        setProducts(res.data);
                        setProductsFiltered(res.data);
                        setProductsCtg(res.data);
                        setInitialState(res.data);
                        // setLoading(false)
                    })
                    .catch((error) => {
                        console.log('Api call error')
                    })
    
                // Categories
                axios
                    .get(`${baseURL}categories`)
                    .then((res) => {
                        setCategories(res.data)
                    })
                    .catch((error) => {
                        console.log('Api categories call error', error)
                    })
    
                return () => {
                    setProducts([]);
                    setProductsFiltered([]);
                    setFocus();
                    setCategories([]);
                    setActive();
                    setInitialState();
                };
            },
            [],
        )
    ))
    
    const searchProduct = (text) => {
        setProductsFiltered(
            products.filter((i) => i.name.toLowerCase().includes(text.toLowerCase()))
        )
    }

    const openList = () => {
        setFocus(true);
    }

    const onBlur = () => {
        setFocus(false);
    }

    // const changeCtg = (ctg) => {
    //     console.log(ctg)
    //     {
    //         ctg === "all"
    //             ? [setProductsCtg(initialState), setActive(true)]
    //             : [
    //                 setProductsCtg(
    //                     products.filter((i) => i.category.$oid === ctg),
    //                     setActive(true)
    //                 ),
    //             ];
    //     }
    // };
    const changeCtg = (ctg) => {
        console.log(ctg)
        {
            ctg === "all"
                ? [setProductsCtg(initialState), setActive(true)]
                : [
                    setProductsCtg(
                        products.filter((i) => (i.category !== null && i.category.id) === ctg ),
                        setActive(true)
                    ),
                ];
        }
    };
    console.log(products)

    return (
        
            <Center>
                <VStack w="100%" space={5} alignSelf="center">
                <Input
    onFocus={openList}
    onChangeText={(text) => searchProduct(text)}
    placeholder="Search"
    variant="filled"
    width="100%"
    height="10"
    borderRadius="10"
    py="1"
    px="2"
    style={{ backgroundColor: 'white', color: 'black' }} // Set background color to pink
    InputLeftElement={<Icon ml="2" size="4" color="pink.900"  as={<Ionicons name="search" />} />}
    InputRightElement={focus === true ? <Icon ml="2" size="4" color="pink.400" as={<Ionicons name="close" size="20" color="black" onPress={onBlur} />} /> : null}
/>


                </VStack>
                {focus === true ? (
                    <SearchedProduct
                        productsFiltered={productsFiltered}
                    />
                ) : (
                    <ScrollView>
                        <View>
                            <Banner />
                        </View>
                        <View >
                            <CategoryFilter
                                categories={categories}
                                categoryFilter={changeCtg}
                                productsCtg={productsCtg}
                                active={active}
                                setActive={setActive}
                            />
                        </View>
                        {productsCtg.length > 0 ? (
                                <View style={styles.listContainer}>
                                    {productsCtg.map((item) => {
                                        return(
                                            <ProductList
                                                // navigation={props.navigation}
                                                key={item._id.$oid}
                                                item={item}
                                            />
                                        )
                                    })}
                                </View>
                                ) : (
                                    <View style={[styles.center, { height: height / 2}]}>
                                        <Text>No products found</Text>
                                    </View>
                                )}
                        {/* <FlatList
                            //    horizontal
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            numColumns={2}
                            data={products}
                            // renderItem={({item}) => <Text>{item.brand}</Text>}
                            renderItem={({ item }) => <ProductList key={item.brand} item={item} />}
                            keyExtractor={item => item.name}
                        /> */}
                    </ScrollView>

                )}
            </Center>
  
    )
}

const styles = StyleSheet.create({
    container: {
        flexWrap: "wrap",
        backgroundColor: "gainsboro",
    },
    listContainer: {
        height: 1500,
        width: width,
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
        backgroundColor: "gainsboro",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ProductContainer;
import * as React from "react";

import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  NativeBaseProvider,
  Button,
  Box,
  HamburgerIcon,
  Pressable,
  Heading,
  VStack,
  Text,
  Center,
  HStack,
  Divider,
  Icon,
} from "native-base";
import { StyleSheet, Image, SafeAreaView, View } from "react-native";
import ProductContainer from "../Screens/Product/ProductContainer";
import "react-native-gesture-handler";
import Login from "../Screens/User/Login";
import Main from "./Main";
import Cart from "../Screens/Cart/Cart";
import Products from "../Screens/Admin/Products";
import AdminNavigator from "./AdminNavigator";
import ProductList from "../Screens/Product/ProductList";
global.__reanimatedWorkletInit = () => {};
const Drawer = createDrawerNavigator();

const getIcon = (screenName) => {
  switch (screenName) {
    case "Inbox":
      return "email";
    case "Outbox":
      return "send";
    case "Cart":
      return "cart";
    case "Product List":
      return "archive";
    case "Trash":
      return "trash-can";
    case "Spam":
      return "alert-circle";
    default:
      return undefined;
  }
};

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} safeArea>
      <VStack space="3" my="1" mx="1">
        <Box px="4">
          <Text bold color="gray.700">
            Mail
          </Text>
          <Text fontSize="14" mt="1" color="gray.500" fontWeight="500">
            john_doe@gmail.com
          </Text>
        </Box>
        <VStack divider={<Divider />} space="4">
          <VStack space="3">
            {props.state.routeNames.map((name, index) => (
              <Pressable
                px="5"
                py="3"
                rounded="md"
                bg={
                  index === props.state.index
                    ? "rgba(6, 182, 212, 0.1)"
                    : "transparent"
                }
                onPress={(event) => {
                  props.navigation.navigate(name);
                }}
              >
                <HStack space="7" alignItems="center">
                  <Icon
                    color={
                      index === props.state.index ? "primary.500" : "gray.500"
                    }
                    size="5"
                    as={<MaterialCommunityIcons name={getIcon(name)} />}
                  />
                  <Text
                    fontWeight="500"
                    color={
                      index === props.state.index ? "primary.500" : "gray.700"
                    }
                  >
                    {name}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>
          <VStack space="5">
            <Text fontWeight="500" fontSize="14" px="5" color="gray.500">
              Labels
            </Text>
            <VStack space="3">
              <Pressable px="5" py="3">
                <HStack space="7" alignItems="center">
                  <Icon
                    color="gray.500"
                    size="5"
                    as={<MaterialCommunityIcons name="bookmark" />}
                  />
                  <Text color="gray.700" fontWeight="500">
                    Family
                  </Text>
                </HStack>
              </Pressable>
              <Pressable px="5" py="2">
                <HStack space="7" alignItems="center">
                  <Icon
                    color="gray.500"
                    size="5"
                    as={<MaterialCommunityIcons name="bookmark" />}
                  />
                  <Text color="gray.700" fontWeight="500">
                    Friends
                  </Text>
                </HStack>
              </Pressable>
              <Pressable px="5" py="3">
                <HStack space="7" alignItems="center">
                  <Icon
                    color="gray.500"
                    size="5"
                    as={<MaterialCommunityIcons name="bookmark" />}
                  />
                  <Text fontWeight="500" color="gray.700">
                    Work
                  </Text>
                </HStack>
              </Pressable>
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </DrawerContentScrollView>
  );
}
const DrawerNavigator = () => {
  return (
    <Box safeArea flex={1}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="Home"
          component={Main}
          options={{
            drawerLabel: "Home",
            title: "Home Screen",
            headerTitle: (props) => <Title {...props} />,
            headerStyle: {
              backgroundColor: "#ffb3c6",
            },
          }}
        />
        {/* <Drawer.Screen name="drawer" component={Main} /> */}
        {/* <Drawer.Screen name="Products" component={ProductContainer}   />
        <Drawer.Screen name="Login" component={Login}  />
        <Drawer.Screen name="Cart" component={Cart} />
        <Drawer.Screen name="Product List" component={Products} />  */}
        <Drawer.Screen
          name="Products"
          component={Main}
          initialParams={{ screen: "Products" }}
          
        />
        <Drawer.Screen
          name="Login"
          component={Main}
          initialParams={{ screen: "User" }}
        />
        <Drawer.Screen
          name="Cart"
          component={Main}
          initialParams={{ screen: "Cart" }}
        />
        <Drawer.Screen
          name="Product List"
          component={Main}
          initialParams={{ screen: "Admin" }}
        />
      </Drawer.Navigator>
    </Box>
  );
};

const Title = () => {
  return (
    <SafeAreaView style={styles.header}>
      <Image
        source={require("../assets/Ethereal.png")}
        resizeMode="contain"
        style={{ height: 50, width: 120, left: 180 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    // padding: 10,
    marginTop: -10,
  },
});

export default DrawerNavigator;

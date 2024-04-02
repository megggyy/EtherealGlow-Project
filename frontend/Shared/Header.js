import React from "react"
import { StyleSheet, Image, SafeAreaView, View } from "react-native"

const Header = () => {
    return (
        //<View style={styles.header}>
        <SafeAreaView style={styles.header}>
            <Image
                source={require("../assets/etherealglowlogo.png")}
                resizeMode="contain"
                style={{ height: 50, width:120, left: 90 }}
            />

        </SafeAreaView>
        //</View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignContent: "center",
        justifyContent: "center",
        // padding: 10,
        marginTop: 50,
        marginBottom:-60,
    }
})

export default Header
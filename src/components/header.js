import React from "react";
import { StyleSheet, View, TouchableOpacity, Text, Image } from "react-native";
import { IMAGES } from "../constants/images";
import { COLORS } from "../constants/colors";

const Header = ({ navigation, title }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={IMAGES.backIcon} style={{ height: 60, width: 60 }} />
      </TouchableOpacity>
      <Text style={styles.headerTxt}>{title}</Text>
    </View>
  );
};
export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 40,
  },
  headerTxt: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: COLORS.white,
    paddingLeft: 10, // Add padding to separate the text from the icon
  },
  btnContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

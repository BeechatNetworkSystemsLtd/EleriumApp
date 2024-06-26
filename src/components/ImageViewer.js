import React from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
const ImageViewer = ({ file }) => {
  let base64String = file.base64_data;
  return (
    <Image
      source={{ uri: `data:image/png;base64,${base64String}` }}
      style={styles.image}
    />
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  image: {
    width: width - 40,
    height: width - 40, // You might want to make this dynamic based on the image aspect ratio
    borderRadius: 10,
  },
});

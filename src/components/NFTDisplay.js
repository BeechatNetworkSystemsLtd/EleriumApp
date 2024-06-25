import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";

const NFTDisplay = ({ data }) => {
  if (data === null) {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={{ color: "#fff" }}>Please connect to the Internet</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Image
          source={{ uri: data?.metadata?.image }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{data?.user?.name}</Text>
        <Text style={styles.title}>{data?.metadata?.name}</Text>
        <Text style={styles.description}>{data?.metadata?.description}</Text>

        {/* Additional rendering based on JSON structure */}
        {/* For example, rendering attributes */}
        <View style={styles.attributesContainer}>
          {data?.metadata?.attributes
            .filter((attr) => attr?.traitType !== "Phygital Public Key") // Exclude the "Phygital public key" trait
            .map((attr, index) => (
              <View key={index} style={styles.attributeRow}>
                <Text style={styles.attributeName}>{attr?.traitType}:</Text>
                <Text style={styles.attributeValue}>{attr?.value}</Text>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLORS.backgroundColor,
  },
  container: {
    backgroundColor: COLORS.backgroundColor,
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: "center", // Center items in the container
  },
  image: {
    width: "100%",
    height: 200, // You might want to make this dynamic based on the image aspect ratio
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    color: COLORS.white,
  },
  description: {
    fontSize: 16,
    color: "#f2f2f2",
    marginTop: 10,
  },
  attributesContainer: {
    alignSelf: "stretch", // Stretch to the width of the container
    marginTop: 20,
  },
  attributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  attributeName: {
    fontWeight: "bold",
    color: COLORS.white,
  },
  attributeValue: {
    flex: 1,
    textAlign: "right",
    color: COLORS.white,
  },
  // Add other style definitions as needed
});

export default NFTDisplay;

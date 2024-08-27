import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";
import { getNFTLink } from "../services/HttpUtils";

const NFTDisplayData = ({ nft_airdrop_response, NFTResult }) => {
  if (nft_airdrop_response === null) {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={{ color: "#fff" }}>Please connect to the Internet</Text>
        </View>
      </ScrollView>
    );
  }

  const filteredMetadata = Object.keys(nft_airdrop_response)
    .filter((key) => !["file", "identityHash", "nfcPublickey"].includes(key))
    .reduce((obj, key) => {
      obj[key] = nft_airdrop_response[key];
      return obj;
    }, {});

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* <View style={styles.attributesContainer}>
          <Text style={[styles.attributeName, { marginTop: 15, fontSize: 20 }]}>
            Metadata{" "}
          </Text>
          {Object.entries(filteredMetadata).map(([key, value]) => (
            <Text
              key={key}
              selectable
              style={[styles.attributeName, { marginTop: 15, fontSize: 14 }]}
            >{`${key}: ${JSON.stringify(value)}`}</Text>
          ))}
        </View> */}

        <View style={{ height: 20 }} />
        <Text style={[styles.attributeName, { marginTop: 15, fontSize: 20 }]}>
          NFT Data{" "}
        </Text>

        {NFTResult &&
          NFTResult.map((nft, index) => (
            <View key={index} style={styles.NFTContainer}>
              {nft?.image ? (
                <Image source={{ uri: nft?.image }} style={styles.nftImage} />
              ) : null}

              <View style={{}}>
                <Text style={styles.attributes}>Name: {nft?.name ?? ""}</Text>
                <Text style={styles.attributes}>
                  Description: {nft?.description ?? ""}
                </Text>
              </View>
              <View style={styles.horizontalLine} />
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

export default NFTDisplayData;

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
    // backgroundColor: "red",
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

  NFTContainer: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,

    marginVertical: 5,
    // borderBottomColor: "#eaeaea",
    alignItems: "flex-start",

    width: "100%",
  },
  nftImage: {
    height: 220,
    width: 220,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 10,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
  },
  attributes: {
    color: COLORS.white,
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "bold",
  },
  horizontalLine: {
    height: 1,
    width: "100%",
    backgroundColor: "gray",
  },

  // Add other style definitions as needed
});

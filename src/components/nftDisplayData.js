import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";
import { getNFTLink } from "../services/HttpUtils";

const NFTDisplayData = ({ nft_airdrop_response, NFTResult }) => {
  console.log("_______________", NFTResult);

  const [imageLinks, setImageLinks] = useState([]);

  useEffect(() => {
    const handleGetLinks = async () => {
      if (Array.isArray(NFTResult)) {
        try {
          const links = await Promise.all(
            NFTResult.map(async (nft) => {
              const link = await getNFTLink(nft.uri);
              return link?.data?.image;
            })
          );
          setImageLinks(links);
        } catch (error) {
          console.error("Error fetching NFT links:", error);
        }
      }
    };

    handleGetLinks();
  }, [NFTResult]);

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
        <View style={styles.attributesContainer}>
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
        </View>

        <View style={{ height: 20 }} />
        <Text style={[styles.attributeName, { marginTop: 15, fontSize: 20 }]}>
          NFT Data{" "}
        </Text>

        {NFTResult &&
          NFTResult.map((nft, index) => (
            <View key={index} style={styles.NFTContainer}>
              {console.log("imageLinks[index]", imageLinks[index])}
              {imageLinks[index] ? (
                <Image
                  source={{ uri: imageLinks[index] }}
                  // source={{
                  //   uri: "https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw54c510f0/pdp/google-home-link20-03.png?sw=904&sh=560",
                  // }}
                  style={styles.nftImage}
                />
              ) : null}
              <View style={{}}>
                <Text style={styles.attributes}>Name: {nft.name ?? ""}</Text>
                <Text style={styles.attributes}>Mint: {nft.mint ?? ""}</Text>
              </View>
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
    borderBottomWidth: 1,
    // borderBottomColor: "#eaeaea",
  },
  nftImage: {
    height: 220,
    width: 220,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 10,
  },
  attributes: {
    color: COLORS.white,
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "bold",
  },

  // Add other style definitions as needed
});

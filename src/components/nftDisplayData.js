import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { COLORS } from "../constants/colors";

const NFTDisplayData = ({ nft_airdrop_response }) => {
  const [deviceID, setDeviceID] = useState(null);

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await DeviceInfo.getUniqueId();

      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

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
            // <TouchableOpacity key={key}>
            <Text
              selectable
              style={[styles.attributeName, { marginTop: 15, fontSize: 14 }]}
            >{`${key}: ${JSON.stringify(value)}`}</Text>
            // </TouchableOpacity>
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
  attributeValue: {
    flex: 1,
    textAlign: "right",
    color: COLORS.white,
  },
  actionBtnsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnContainer: { height: 70, width: "35%" },
  // Add other style definitions as needed
});

export default NFTDisplayData;

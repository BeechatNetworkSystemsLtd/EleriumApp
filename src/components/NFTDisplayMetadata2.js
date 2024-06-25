import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import FileViewer from "../screens/fileViewer";
import SButton from "./button";
import DeviceInfo from "react-native-device-info";

const NFTDisplayMetadata2 = ({
  data,
  onDeleteMetaData2,
  onEditMetaData2,
  identityHash,
}) => {
  const [deviceID, setDeviceID] = useState(null);

  useEffect(() => {
    const fetchDeviceID = async () => {
      const id = await DeviceInfo.getUniqueId();

      setDeviceID(id);
    };
    fetchDeviceID();
  }, []);

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
        {data?.metadata2?.hasOwnProperty("file") && (
          <FileViewer data={data?.metadata2?.file} />
        )}
        <View style={styles.attributesContainer}>
          {Object.entries(data?.metadata2)?.map(([key, value]) => {
            return key === "file" ||
              key === "identityHash" ||
              key === "nfcPublickey" ? null : (
              <View key={key} style={styles.attributeRow}>
                <Text style={styles.attributeName}>{key}:</Text>
                <Text style={styles.attributeValue}>{String(value)}</Text>
              </View>
            );
          })}
        </View>
      </View>
      {deviceID == data?.metadata2?.identityHash && (
        <View style={styles.actionBtnsContainer}>
          <View style={styles.btnContainer}>
            <SButton title={"Edit"} onPress={onEditMetaData2} />
          </View>
          <View style={styles.btnContainer}>
            <SButton title={"Delete"} onPress={onDeleteMetaData2} />
          </View>
        </View>
      )}
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
  actionBtnsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnContainer: { height: 70, width: "35%" },
  // Add other style definitions as needed
});

export default NFTDisplayMetadata2;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Header from "../components/header";
import RNSecureKeyStore from "react-native-secure-key-store";
import { COLORS } from "../constants/colors";
import { getMyAssets, retrievingMetadata } from "../services/HttpUtils";
import { SCREENS } from "../constants/screens";

const MyCreatedAssets = (props) => {
  const { navigation } = props;
  const [identityHash, setIdentityHash] = useState(null);
  const [hashList, setHashList] = useState([]);
  const [hashListData, setHashListData] = useState([]);

  useEffect(() => {
    if (identityHash) loadMyCreatedAssets("http://138.68.190.112/");
  }, [identityHash]);

  useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");
        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;
          setIdentityHash(publicKey);
        }
      } catch (error) {
        console.error("Error reading secure key store:", error);
      }
    }

    readStoredIdentity();
  }, []);

  useEffect(() => {
    if (hashList.length) {
      fetchAllData(hashList).then((results) => {
        const validResults = results.filter((result) => result !== null);
        setHashListData(validResults);
      });
    }
  }, [hashList]);

  const loadMyCreatedAssets = (url) => {
    getMyAssets(url, {}, identityHash)
      .then((res) => {
        if (res.data.data.list) setHashList(res.data.data.list);
      })
      .catch(() => {
        let otherURL = "http://159.65.54.39/";
        if (url !== otherURL) {
          loadMyCreatedAssets(otherURL);
        } else {
          // Handle error appropriately, e.g., set state to indicate failure
        }
      });
  };

  const _retrieveDataFromEDI = (url, publicKey) => {
    return new Promise((resolve, reject) => {
      retrievingMetadata(url, {}, publicKey)
        .then((res) => {
          if (res?.data === "" || res?.data == null) {
            resolve(null);
          } else {
            resolve(res?.data?.data);
          }
        })
        .catch((error) => {
          let otherURL = "http://159.65.54.39/";
          if (url !== otherURL) {
            _retrieveDataFromEDI(otherURL, publicKey)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  };

  const fetchAllData = async (publicKeys) => {
    let results = [];
    for (let publicKey of publicKeys) {
      try {
        const data = await _retrieveDataFromEDI(
          "http://138.68.190.112/",
          publicKey
        );
        results.push(data);
      } catch (error) {
        console.error("Error retrieving data for publicKey:", publicKey, error);
      }
    }
    return results;
  };

  const handleEditAsset = (EDIData) => {
    props.navigation.navigate(SCREENS.REGISTER_TAGS, {
      nfcResult: null,
      from: "edit",
      EDIData: EDIData,
    });
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title={"My Created Assets"} />
      <View style={styles.contentContainer}>
        {hashListData.length > 0 ? (
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={hashListData}
            renderItem={({ item, index }) => {
              return (
                <>
                  <TouchableOpacity
                    style={styles.tile}
                    activeOpacity={0.8}
                    onPress={() => handleEditAsset(item)}
                  >
                    <Text style={styles.btnTxt}>Tag {index}</Text>
                  </TouchableOpacity>
                </>
              );
            }}
          />
        ) : (
          <Text style={[styles.btnTxt, { color: "white" }]}>Loading...</Text>
        )}
      </View>
    </View>
  );
};

export default MyCreatedAssets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  contentContainer: {
    padding: 30,
    flex: 0.99,
  },

  tile: {
    padding: 20,
    backgroundColor: "#ffd60a",
    width: "100%",
    marginTop: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  btnTxt: {
    color: "black",
    fontFamily: "monospace",
    fontSize: 20,
  },
});

import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import SButton from "../components/button";
import crypto from "crypto";
import { dqxPerformNFC } from "@beechatnetwork/lib-dqx/rn-api.js";
import {
  dilithiumVerifySig,
  signChallenge,
  dilithiumSign,
} from "@beechatnetwork/lib-dqx";
import Clipboard from "@react-native-clipboard/clipboard";
import NfcManager from "react-native-nfc-manager";
import { bytesToHex } from "../services/helpers";
import { IMAGES } from "../constants/images";
import { COLORS } from "../constants/colors";
import { SCREENS } from "../constants/screens";
import { getString } from "../services/storageUtils";

import {
  doLookupTag,
  removingMetadata,
  retrievingMetadata,
} from "../services/HttpUtils";
import { sha256 } from "js-sha256";
import NFTDisplay from "../components/NFTDisplay";
import NFTDisplayMetadata2 from "../components/NFTDisplayMetadata2";
import Toast from "react-native-toast-message";
const dimensions = Dimensions.get("window");
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import DeviceInfo from "react-native-device-info";
const Main = (props) => {
  const { navigation } = props;
  const [isWorking, setIsWorking] = React.useState(false);
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const [challenge, setChallenge] = React.useState(null);
  const [nfcResult, setNfcResult] = React.useState(null);
  const [verifyResult, setVerifyResult] = React.useState(null);
  const [tagRegistryURL, setTagRegistryURL] = React.useState("");
  const [lookupResult, setLookupResult] = React.useState(null);
  const [isEDIData, setIsEDIData] = React.useState(false);
  const [EDIData, setEDIdata] = React.useState(false);
  const [identityHash, setIdentityHash] = React.useState(null);
  const [identitySecret, setIdentitySecret] = React.useState(null);
  const [showChallenge, setShowChallenge] = React.useState(null);
  let verifyTagLabel = "VERIFY TAG";
  let verifyButtonStyle = "normal";

  async function btnPerformSigning() {
    setWorkStatusMessage("PLEASE TAP TAG");
    setIsWorking(true);

    let result = null;
    try {
      result = await dqxPerformNFC(
        signChallenge,
        { setWorkStatusMessage },
        { challenge }
      );
      const hashedPublicKey = bytesToHex(result?.publicKey);

      setNfcResult(result);
    } catch (e) {
      console.log(e);
      if (e.message) {
        Alert.alert("Error!", e.message);
      } else {
        Alert.alert("Communication error!");
      }
    }

    await generateChallenge();
    setIsWorking(false);
  }

  async function generateChallenge() {
    let tmp = crypto.randomBytes(32);
    setChallenge(tmp);
  }

  React.useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");
        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;

          const hashedPublicKey = sha256(Buffer.from(publicKey, "hex"));
          setIdentityHash(publicKey);
          setIdentitySecret(keypair.secretKey);
        }
      } catch (error) {
        console.error("Error reading secure key store:", error);
      }
    }

    readStoredIdentity();
  }, []);

  React.useEffect(() => {
    async function readStoredSettings() {
      let rememberedURL = null;

      try {
        rememberedURL = await getString("dqxRegistryURL");
      } finally {
        if (!rememberedURL) {
          // rememberedURL = "https://beechat.buzz";
          rememberedURL = "https://xrpstudio.io";
        }
      }

      setTagRegistryURL(rememberedURL);
    }

    readStoredSettings();
  }, []);

  React.useEffect(() => {
    async function initNfc() {
      try {
        await NfcManager.start();
        const isSupported = await NfcManager.isSupported();
        const isEnabled = await NfcManager.isEnabled();

        if (!isSupported || !isEnabled) {
          Alert.alert(
            "NFC Unavailable",
            "NFC is not supported or enabled on this device. Some features may not be available.",
            [{ text: "OK" }]
          );
        }
      } catch (ex) {
        console.error(ex);
        Alert.alert("ERROR", "Failed to initialize NFC", [{ text: "OK" }]);
      }
    }

    initNfc();
  }, []);

  React.useEffect(() => {
    generateChallenge();
  }, []);

  React.useEffect(() => {
    async function verifySignature() {
      if (nfcResult && nfcResult.signature) {
        setVerifyResult(
          await dilithiumVerifySig({
            publicKey: nfcResult.publicKey,
            challenge: nfcResult.challenge,
            signature: nfcResult.signature,
          })
        );
        let lookupRes = null;
        if (tagRegistryURL) {
          lookupRes = await doLookupTag({
            serverAddr: tagRegistryURL,
            publicKeyHash: bytesToHex(nfcResult.publicKey),
          });

          setLookupResult(lookupRes);

          if (lookupRes?.includes("Error")) {
            _retrieveDataFromEDI("http://138.68.190.112/");
          }
        } else {
          // if no result found or tagRegistryURL is null then check from EDI
          _retrieveDataFromEDI("http://138.68.190.112/");
        }
      }
    }

    verifySignature();
  }, [nfcResult, tagRegistryURL]);

  //handle retrieve data from EDI

  const _retrieveDataFromEDI = (url) => {
    retrievingMetadata(url, (headers = {}), sha256(nfcResult.publicKey))
      .then((res) => {
        if (res?.data == "" || res?.data == null) {
          props.navigation.navigate(SCREENS.REGISTER_TAGS, {
            nfcResult: nfcResult,
          });
        } else {
          setEDIdata(res?.data?.data);
          setIsEDIData(true);
        }
      })
      .catch((error) => {
        console.log(url, "error while finding ", error);

        let otherURL = "http://159.65.54.39/";
        if (url != otherURL) {
          _retrieveDataFromEDI(otherURL);
        } else {
          setIsEDIData(false);
          setEDIdata(null);
        }
      });
  };

  function copyPublicKeyToClipboard() {
    if (nfcResult && nfcResult.publicKey) {
      Clipboard.setString(bytesToHex(nfcResult.publicKey));
      Alert.alert("Public key was copied to the clipboard!");
    }
  }
  async function cancelNfcOperation() {
    if (isWorking) {
      await NfcManager.cancelTechnologyRequest();
    }
    setNfcResult(null);
    setIsWorking(false);
    setIsEDIData(false);
  }

  const handlePressSetting = async () => {
    await cancelNfcOperation();
    navigation.navigate(SCREENS.SETTINGS);
  };

  const onEditMetaData2 = () => {
    verifyTagLabel = "VERIFY TAG";
    verifyButtonStyle = "normal";
    setEDIdata(null);
    // setVerifyResult(null);
    setIsEDIData(false);
    setWorkStatusMessage("");

    props.navigation.navigate(SCREENS.REGISTER_TAGS, {
      nfcResult: nfcResult,
      from: "edit",
      EDIData: EDIData,
    });
  };

  const onDeleteMetaData2 = async (url) => {
    let headers = {
      publickey: bytesToHex(nfcResult?.publicKey),
      challenge: bytesToHex(nfcResult?.challenge),
      signature: bytesToHex(nfcResult?.signature),
    };
    removingMetadata(url, headers, sha256(nfcResult.publicKey))
      .then(() => {
        setEDIdata(null);
        isEDIData(false);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Tag deleted successfully",
          topOffset: 70,
        });
        cancelNfcOperation();
      })
      .catch((error) => {
        let otherURL = "http://159.65.54.39/";
        if (url != otherURL) {
          onDeleteMetaData2(otherURL);
        } else {
          setIsEDIData(false);
          setEDIdata(null);
        }
        cancelNfcOperation();
      });
    return;
  };

  let tagsPublicKey =
    nfcResult && nfcResult.publicKey ? sha256(nfcResult.publicKey) : "";

  if (isWorking) {
    verifyButtonStyle = "working";
  } else if (nfcResult && nfcResult.signature) {
    verifyButtonStyle = verifyResult ? "success" : "failure";
    verifyTagLabel = verifyResult ? "TAG VERIFIED" : "TAG NOT VERIFIED";
  }

  const width = dimensions.width - 80;
  const imageHeight = Math.round((width * 439) / 1401);
  const imageWidth = width;

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        // style={{ flex: 0.8 }}
        nestedScrollEnabled
      >
        <View style={{ padding: 40 }}>
          <Image
            source={IMAGES.horizontalLogo}
            style={{
              height: imageHeight,
              width: imageWidth,
              resizeMode: "contain",
            }}
          />
        </View>
        <View style={styles.btnContainer}>
          <SButton
            onPress={() => btnPerformSigning()}
            title={!isWorking ? verifyTagLabel : workStatusMessage}
            disabled={isWorking}
            btnStyle={verifyButtonStyle}
          />
        </View>
        <View style={{ paddingHorizontal: 10 }}>
          {tagsPublicKey && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.hashKeyText}>Public key hash:</Text>
              <View style={styles.publicKeyContainer}>
                <TouchableOpacity
                  onPress={() => copyPublicKeyToClipboard()}
                  style={{ width: "90%" }}
                >
                  <View style={{}}>
                    <Text style={styles.publicHashKeyTxt}>{tagsPublicKey}</Text>
                  </View>
                </TouchableOpacity>
                {/* <View style={styles.verticalLine} /> */}
                <TouchableOpacity
                  onPress={() => setShowChallenge(!showChallenge)}
                  style={styles.dropdownBtn}
                >
                  <Image
                    source={IMAGES.dropdownIcon3}
                    style={[
                      styles.dropdownIcon,
                      showChallenge && { transform: [{ rotate: "180deg" }] },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              {showChallenge && (
                <>
                  <Text style={[styles.hashKeyText, { marginTop: 20 }]}>
                    Challenge:
                  </Text>
                  <View style={{ backgroundColor: "white", borderRadius: 10 }}>
                    <Text style={styles.publicHashKeyTxt}>
                      {sha256(challenge)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          {isEDIData && (
            <NFTDisplayMetadata2
              data={EDIData}
              onDeleteMetaData2={() =>
                Alert.alert("Alert", "Are you to remove data?", [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => onDeleteMetaData2("http://138.68.190.112/"),
                  },
                ])
              }
              onEditMetaData2={onEditMetaData2}
              identityHash={identityHash}
            />
          )}
          {lookupResult?.metadata && <NFTDisplay data={lookupResult} />}
        </View>
        <View style={{ height: 150, width: "100%" }} />
      </ScrollView>

      {/* <View style={styles.settingIconContainer}> */}
      <TouchableOpacity
        onPress={handlePressSetting}
        style={styles.settingIconContainer}
      >
        <Image source={IMAGES.settingIcon} style={{ height: 80, width: 80 }} />
      </TouchableOpacity>
      {/* </View> */}
    </View>
  );
};
export default Main;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundColor },
  btnContainer: { paddingTop: 30, padding: 20 },
  hashKeyText: {
    color: COLORS.white,
    marginBottom: 20,
  },
  settingIconContainer: {
    // backgroundColor: "#010523",
    alignItems: "center",

    paddingHorizontal: 30,

    height: 80,
    width: 80,
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  lookupTxt: {
    padding: 15,
    color: "black",
    fontFamily: "monospace",
  },
  publicHashKeyTxt: {
    color: "black",
    padding: 15,
  },
  publicKeyContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
  },
  verticalLine: {
    height: "100%",
    width: 2,
    backgroundColor: COLORS.secondary,
  },
  dropdownIcon: {
    height: 25,
    width: 25,
    resizeMode: "contain",
    // tintColor: COLORS.primary,
  },
  dropdownBtn: {
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
});

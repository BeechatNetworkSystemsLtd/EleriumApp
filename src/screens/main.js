import React from "react";
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
import { dilithiumVerifySig, signChallenge } from "@beechatnetwork/lib-dqx";
import Clipboard from "@react-native-clipboard/clipboard";
import NfcManager from "react-native-nfc-manager";
import { bytesToHex } from "../services/helpers";
import { IMAGES } from "../constants/images";
import { COLORS } from "../constants/colors";
import { SCREENS } from "../constants/screens";
import { getString } from "../services/storageUtils";

import { doLookupTag } from "../services/HttpUtils";
import { sha256 } from "js-sha256";
const dimensions = Dimensions.get("window");
const Main = (props) => {
  const { navigation } = props;
  const [isWorking, setIsWorking] = React.useState(false);
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const [challenge, setChallenge] = React.useState(null);
  const [nfcResult, setNfcResult] = React.useState(null);
  const [verifyResult, setVerifyResult] = React.useState(null);
  const [tagRegistryURL, setTagRegistryURL] = React.useState("");

  const [lookupResult, setLookupResult] = React.useState(null);

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
      console.log(result);
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
    async function readStoredSettings() {
      let rememberedURL = null;

      try {
        rememberedURL = await getString("dqxRegistryURL");
      } finally {
        if (!rememberedURL) {
          rememberedURL = "https://beechat.buzz";
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

        if (tagRegistryURL) {
          let lookupRes = await doLookupTag({
            serverAddr: tagRegistryURL,
            publicKeyHash: sha256(nfcResult.publicKey),
          });
          setLookupResult(lookupRes);
        }
      }
    }

    verifySignature();
  }, [nfcResult, tagRegistryURL]);

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
  }

  const handlePressSetting = async () => {
    await cancelNfcOperation();
    navigation.navigate(SCREENS.SETTINGS);
    // setVerifyResult(false);
    // setNfcResult(null);
    // setViewMode("create");
  };

  let tagsPublicKey =
    nfcResult && nfcResult.publicKey ? sha256(nfcResult.publicKey) : "";
  let verifyButtonStyle = "normal";
  let verifyTagLabel = "VERIFY TAG";
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
        style={{ flex: 0.8 }}
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
        {tagsPublicKey && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.hashKeyText}>Public key hash:</Text>
            <TouchableOpacity onPress={() => copyPublicKeyToClipboard()}>
              <View style={{ backgroundColor: "white" }}>
                <Text style={styles.publicHashKeyTxt}>{tagsPublicKey}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {lookupResult && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.hashKeyText}>Data on the server:</Text>
            <View style={{ backgroundColor: "white" }}>
              <Text style={styles.lookupTxt}>
                {JSON.stringify(lookupResult, null, 4)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.settingIconContainer}>
        <TouchableOpacity onPress={handlePressSetting}>
          <Image
            source={IMAGES.settingIcon}
            style={{ height: 80, width: 80 }}
          />
        </TouchableOpacity>
      </View>
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
    flex: 0.2,
    flexDirection: "row",
    backgroundColor: "#010523",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 30,
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
});

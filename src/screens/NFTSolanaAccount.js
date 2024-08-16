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
import { bytesToHex, hexToBytes, hexToBytesIOS } from "../services/helpers";
import { IMAGES } from "../constants/images";
import { COLORS } from "../constants/colors";
import { SCREENS } from "../constants/screens";
import { getString } from "../services/storageUtils";

import {
  doLookupTag,
  removingMetadata,
  retrievingMetadata,
  uploadWallet,
} from "../services/HttpUtils";
import { sha256 } from "js-sha256";
import NFTDisplay from "../components/NFTDisplay";
import NFTDisplayMetadata2 from "../components/NFTDisplayMetadata2";
import Toast from "react-native-toast-message";
const dimensions = Dimensions.get("window");
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import DeviceInfo from "react-native-device-info";
import NFTDisplayData from "../components/nftDisplayData";

import Modal from "react-native-modal";
import HasNFTSolanaAccount from "../components/hasNFTSolanaAccount";
const NFTSolanaAccount = (props) => {
  let verifyTagLabel = "VERIFY TAG";
  let verifyButtonStyle = "normal";

  const { navigation } = props;
  const [isWorking, setIsWorking] = React.useState(false);
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const [challenge, setChallenge] = React.useState(null);
  const [showChallenge, setShowChallenge] = React.useState(null);
  const [nfcResult, setNfcResult] = React.useState(null);
  const [nft_airdrop_response, set_nft_airdrop_response] = React.useState(null);
  const [showNFTSolanaAccount, setShowNFTSolanaAccount] = React.useState(true);

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
    // let tmp = crypto.randomBytes(32);

    let deviceId = await DeviceInfo.getUniqueId();
    let hash = crypto.createHash("sha256").update(deviceId).digest();
    let truncatedHash = hash.slice(0, 32);
    setChallenge(truncatedHash);
  }

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

  const handleClose = () => {
    setShowNFTSolanaAccount(false);
  };
  const handleEnterNFTPublicKey = (value) => {
    console.log("value entered ", value);
    setShowNFTSolanaAccount(false);
  };

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

          {nft_airdrop_response && (
            <NFTDisplayData nft_airdrop_response={nft_airdrop_response} />
          )}
        </View>

        <View style={styles.btnContainer}>
          <SButton
            onPress={() => btnPerformSigning()}
            title={!isWorking ? verifyTagLabel : workStatusMessage}
            disabled={isWorking}
            btnStyle={verifyButtonStyle}
          />
        </View>
      </ScrollView>
      <Modal isVisible={showNFTSolanaAccount} avoidKeyboard={true}>
        <HasNFTSolanaAccount
          onClose={handleClose}
          onEnterNFTPublicKey={handleEnterNFTPublicKey}
        />
      </Modal>
    </View>
  );
};
export default NFTSolanaAccount;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },

  btnContainer: {
    paddingTop: 30,
    padding: 20,
  },
  hashKeyText: {
    color: COLORS.white,
    marginBottom: 20,
  },
  publicKeyContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
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

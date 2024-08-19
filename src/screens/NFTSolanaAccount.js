import {
  dilithiumGenKeyPair,
  dilithiumVerifySig,
  signChallenge,
} from "@beechatnetwork/lib-dqx";
import { dqxPerformNFC } from "@beechatnetwork/lib-dqx/rn-api.js";
import crypto from "crypto";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SButton from "../components/button";
import { COLORS } from "../constants/colors";
import { IMAGES } from "../constants/images";
import { bytesToHex } from "../services/helpers";

import { sha256 } from "js-sha256";
import DeviceInfo from "react-native-device-info";
import Toast from "react-native-toast-message";
import NFTDisplayData from "../components/nftDisplayData";
import { getNFTs, uploadWallet } from "../services/HttpUtils";
const dimensions = Dimensions.get("window");

import Modal from "react-native-modal";
import { randomBytes } from "react-native-randombytes";
import AppLoading from "../components/AppLoader";
import HasNFTSolanaAccount from "../components/hasNFTSolanaAccount";

import { Keypair } from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { programs } from "@metaplex/js";

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
  const [salonaPublicKey, setSalonaPublicKey] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [verifyResult, setVerifyResult] = React.useState(null);
  const [NFTRestults, setNFTResults] = React.useState([]);

  async function btnPerformSigning() {
    console.log(">>>>>>>> ", challenge);

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

    // await generateChallenge();
    setIsWorking(false);
  }
  async function generateChallenge() {
    // let tmp = crypto.randomBytes(32);

    let deviceId = await DeviceInfo.getUniqueId();
    let hash = crypto.createHash("sha256").update(deviceId).digest();
    let truncatedHash = hash.slice(0, 32);
    setChallenge(truncatedHash);
  }

  React.useEffect(() => {
    generateChallenge();
  }, []);

  React.useEffect(() => {
    async function verifySignature() {
      if (nfcResult && nfcResult.signature) {
        if (!salonaPublicKey) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "please enter Salona Account",
            topOffset: 70,
          });
          return;
        }

        let verifiedSignature = await dilithiumVerifySig({
          publicKey: nfcResult.publicKey,
          challenge: nfcResult.challenge,
          signature: nfcResult.signature,
        });

        console.log("verified signature--", verifiedSignature);
        setVerifyResult(verifiedSignature);

        setIsLoading(true);
        let deviceId = await DeviceInfo.getUniqueId();
        let data = {
          dilithium2_signature: bytesToHex(nfcResult.signature),
          // dilithium2_signature:
          //   "9e3f9dbda8a4b29b3b6e5f68e479e5bcda96ddf0777250f59eb6a2e92a366a55d24cde5c5f37e54eab346a8b9a49c432",
          hash_of_tag: sha256(nfcResult.publicKey),
          uuid: deviceId,
          public_key: salonaPublicKey,
          // public_key: "9dEYVF9bDQ3wQbjr2BxZchFNYdHyfxVDnXgfzvPqMaAC",
        };
        uploadWallet(data)
          .then(async (res) => {
            console.log("reponse from upload ", res.data.nft_airdrop_response);

            set_nft_airdrop_response(res.data.nft_airdrop_response);
            handleGetNFTResults(salonaPublicKey);
          })
          .catch((error) => {
            console.log(
              "error on upload- ",
              error.message == "Request failed with status code 403"
            );
            Toast.show({
              type: "error",
              text1: "Error",
              text2:
                error.message == "Request failed with status code 403"
                  ? "Signature already used"
                  : "Something went wrong with server",
              topOffset: 70,
            });

            setIsLoading(false);

            set_nft_airdrop_response(null);
          });
        return;
      }
    }

    verifySignature();
  }, [nfcResult]);

  const handleGetNFTResults = async (publicKey) => {
    setTimeout(async () => {
      // const NFTs = await getNFTs(
      //   "9dEYVF9bDQ3wQbjr2BxZchFNYdHyfxVDnXgfzvPqMaAC"
      // );
      const NFTs = await getNFTs(publicKey);

      console.log("NFTs  results", NFTs);
      setNFTResults(NFTs);
      setIsLoading(false);
    }, 60000);
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

  const handleClose = async () => {
    const { publicKey, secretKey } = await dilithiumGenKeyPair({
      randomBytes: (size) => {
        return Buffer.from(randomBytes(size));
      },
    });
    const account = Keypair.generate();
    setSalonaPublicKey(account.publicKey);
    setShowNFTSolanaAccount(false);
  };
  const handleEnterNFTPublicKey = (value) => {
    console.log("value entered ", value);
    setSalonaPublicKey(value);
    setShowNFTSolanaAccount(false);
  };

  return (
    <View style={styles.container}>
      {AppLoading(isLoading)}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        // style={{ flex: 0.8 }}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
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

          {nft_airdrop_response && (
            <NFTDisplayData
              nft_airdrop_response={nft_airdrop_response}
              NFTResult={NFTRestults.length > 0 ? NFTRestults : []}
            />
          )}
          {/* <View style={{ height: 20 }} />
          <Text>sohi</Text>
          {NFTRestults.length !== 0 &&
            NFTRestults.map(async (data) => {
              const link = await getNFTLink(data.uri);
              return (
                <View style={styles.NFTContainer}>
                  <Image source={{ uri: link.image }} style={styles.nftImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attributes}>
                      Name:{data?.name ?? ""}
                    </Text>
                    <Text style={styles.attributes}>
                      Mint:{data?.mint ?? ""}
                    </Text>
                  </View>
                </View>
              );
            })} */}
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
  NFTContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  nftImage: {
    height: 70,
    width: 70,
    resizeMode: "contain",
  },
  attributes: {
    color: COLORS.white,
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "bold",
  },
});

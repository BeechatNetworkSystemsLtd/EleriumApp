import React, { useState, useEffect } from "react";
import Share from "react-native-share";
import {
  Platform,
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import SButton from "../components/button";
import { Buffer } from "buffer/";
import {
  dilithiumSign,
  dilithiumVerifySig,
  dilithiumGenKeyPair,
} from "@beechatnetwork/lib-dqx";
import { randomBytes } from "react-native-randombytes";
import { sha256 } from "js-sha256";
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { COLORS } from "../constants/colors";
import DocumentPicker from "react-native-document-picker";
import RNFS from "react-native-fs";
import Header from "../components/header";
import { SCREENS } from "../constants/screens";
import Modal from "react-native-modal";
import CustomTextInput from "../components/textInput";
import Toast from "react-native-toast-message";
import { IMAGES } from "../constants/images";
import { retrievingMetadata } from "../services/HttpUtils";
import AppLoading from "../components/AppLoader";
const Identity = (props) => {
  const { navigation } = props;

  const [fileHash, setFileHash] = useState("");
  const [bufferLength, setBufferLength] = useState(0);
  const [identityHash, setIdentityHash] = React.useState(null);
  const [enterPublicKey, setEnterPublicKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const buffer = Buffer.from(fileHash, "hex");
    setBufferLength(buffer.length);
  }, [fileHash]);

  React.useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");
        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;
          const hashedPublicKey = sha256(Buffer.from(publicKey, "hex"));
          setIdentityHash(hashedPublicKey);
        }
      } catch (error) {
        console.error("Error reading secure key store:", error);
      }
    }

    readStoredIdentity();
  }, []);

  const handleFileInput = async () => {
    try {
      const pickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      // Log the picker result to see its structure

      // Assuming we're only picking one file, access the first item in the array
      const uri = pickerResult[0].uri;

      // Check if the URI exists and is a string
      if (uri && typeof uri === "string") {
        // Android content URI handling
        if (Platform.OS === "android" && uri.startsWith("content://")) {
          // Create a path for the temporary file copy
          const newFilePath = `${RNFS.CachesDirectoryPath}/${pickerResult[0].name}`;

          // Copy the file from the content URI to the new file path
          await RNFS.copyFile(uri, newFilePath);

          // Read the file content as base64
          const fileContent = await RNFS.readFile(newFilePath, "base64");

          // Hash the file content
          const hashedFile = sha256(fileContent);

          // Update state with the hash
          setFileHash(hashedFile);
        }
      } else {
        console.warn("No file URI was found.");
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        console.error("File Picker Error:", err);
        Alert.alert("Error", "An error occurred while selecting the file.");
      }
    }
  };

  const signMessage = async () => {
    try {
      const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");
      if (storedKeypair) {
        const keypair = JSON.parse(storedKeypair);
        const secretKey = keypair.secretKey;
        const publicKey = keypair.publicKey;

        // Sign the hash

        const signature = await dilithiumSign({
          secretKey: Buffer.from(secretKey, "hex"),
          challenge: Buffer.from(fileHash, "hex"),
        });

        // Create the JSON object
        const signatureData = {
          signature: signature.toString("hex"),
          challenge: fileHash.toString("hex"),
          publicKey: publicKey.toString("hex"),
        };
        // Convert JSON object to string
        const signatureString = JSON.stringify(signatureData);

        // Save the JSON string to a file
        const filename = "signature.sig";
        const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
        await RNFS.writeFile(path, signatureString, "utf8");

        // Share the file
        const shareOptions = {
          title: "Share Signature",
          url: `file://${path}`, // Use file URL
          type: "application/json",
        };

        await Share.open(shareOptions);
      }
    } catch (error) {
      console.error("Error reading secure key store:", error);
    }
  };

  const handleVerify = async () => {
    try {
      const pickedFiles = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      // Check if any file is selected
      if (!pickedFiles || pickedFiles.length === 0) {
        Alert.alert("Error", "No file selected.");
        return;
      }

      // Use the first picked file
      const pickedFile = pickedFiles[0];

      const fileContent = await RNFS.readFile(pickedFile.uri, "utf8");
      const { signature, publicKey, challenge } = JSON.parse(fileContent);

      const isValidSignature = await dilithiumVerifySig({
        publicKey: Buffer.from(publicKey, "hex"),
        challenge: Buffer.from(challenge, "hex"),
        signature: Buffer.from(signature, "hex"),
      });

      // Hash the public key using SHA-256
      const hashedPublicKey = sha256(publicKey);

      if (isValidSignature) {
        Alert.alert(
          "Verification",
          "Valid Signature. Created by " + hashedPublicKey,
          [
            {
              text: "OK",
              onPress: () => Alert.alert("Original hash", challenge),
            },
          ]
        );
      } else {
        Alert.alert("Verification", "Invalid Signature");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      Alert.alert("Error", "An error occurred during verification.");
    }
  };

  const createIdentity = async () => {
    try {
      const { publicKey, secretKey } = await dilithiumGenKeyPair({
        randomBytes: (size) => {
          return Buffer.from(randomBytes(size));
        },
      });

      // Hash the public key using SHA-256
      const hashedPublicKey = sha256(publicKey.toString("hex"));

      // Save the keypair securely
      const keypair = JSON.stringify({
        publicKey: publicKey.toString("hex"),
        secretKey: secretKey.toString("hex"),
      });
      await RNSecureKeyStore.set("dilithiumKeypair", keypair, {
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      Alert.alert(
        "Identity Created",
        "Your Dilithium keypair has been successfully generated and saved securely. Your hash: " +
          hashedPublicKey
      );
    } catch (error) {
      console.error("Error in createIdentity:", error);
      Alert.alert(
        "Error",
        `Failed to create identity: ${error.message || error.toString()}`
      );
    }
    navigation.goBack();
  };

  const handleMyCreatedAssets = () => {
    navigation.navigate(SCREENS.MY_CREATED_ASSETS);
  };

  const handlePostNewTag = () => {
    setShowModal(true);
  };
  const handleOnProceed = () => {
    if (enterPublicKey.trim() == "") {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please Enter or paste public key.",
        topOffset: 70,
      });
    } else {
      closeModal();
      setTimeout(() => {
        _retrieveDataFromEDI("http://138.68.190.112/");
      }, 500);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEnterPublicKey("");
  };

  const _retrieveDataFromEDI = (url) => {
    setIsLoading(true);
    retrievingMetadata(url, (headers = {}), enterPublicKey)
      .then((res) => {
        if (res?.data == "" || res?.data == null) {
          setIsLoading(false);
          let temp = Buffer.from(enterPublicKey, "hex");

          props.navigation.navigate(SCREENS.REGISTER_TAGS, {
            nfcResult: { publicKey: temp.toJSON().data },
          });
        } else {
          setIsLoading(false);

          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Tag already exists",
            topOffset: 70,
          });
        }
      })
      .catch((error) => {
        console.log(url, "error while finding ", error);

        let otherURL = "http://159.65.54.39/";
        if (url != otherURL) {
          _retrieveDataFromEDI(otherURL);
        } else {
          setIsLoading(false);

          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Something went wrong",
            topOffset: 70,
          });
        }
      });
  };

  console.log("data2 ", enterPublicKey);

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title={"Identity"} />
      {AppLoading(isLoading)}
      <View style={styles.contentContainer}>
        <View style={styles.btnContainer}>
          {/* Buttons for Identity actions */}
          {identityHash ? (
            <View style={styles.btnContainer}>
              <SButton
                title="My Created Assets"
                onPress={handleMyCreatedAssets} // Referencing the existing createIdentity function
                btnStyle={"normal"}
              />
            </View>
          ) : (
            <View style={styles.btnContainer}>
              <SButton
                title="Create New Identity"
                onPress={createIdentity} // Referencing the existing createIdentity function
                btnStyle={"normal"}
              />
            </View>
          )}

          {identityHash && (
            <View style={styles.btnContainer}>
              <SButton
                title="Post new Tag"
                onPress={handlePostNewTag} // Referencing the existing createIdentity function
                btnStyle={"normal"}
              />
            </View>
          )}

          <View style={styles.btnContainer}>
            <SButton
              title="Load File to Hash"
              onPress={handleFileInput}
              btnStyle="normal"
            />
            {fileHash ? (
              <>
                <Text style={[styles.hashText, { color: COLORS.text }]}>
                  Hash: {fileHash}
                </Text>
                <SButton
                  title="Sign Hash"
                  onPress={signMessage}
                  btnStyle="normal"
                />
              </>
            ) : null}
          </View>

          <View style={styles.btnContainer}>
            <SButton
              title="Verify Message"
              onPress={handleVerify}
              btnStyle={"normal"}
            />
          </View>
          <View style={styles.btnContainer}>
            <SButton
              title="Export Keys"
              onPress={() => {
                /* Placeholder function */
              }}
              btnStyle={"normal"}
            />
          </View>
        </View>
      </View>
      <Modal
        isVisible={showModal}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeading}>Enter/Paste public key</Text>

          <View style={styles.textInputContainer}>
            <CustomTextInput
              onChangeText={setEnterPublicKey}
              value={enterPublicKey}
              customStyle={{}}
              placeholder={"Public Key"}
            />
          </View>
          <SButton
            title="Proceed"
            btnStyle={"normal"}
            onPress={handleOnProceed}
          />
          <TouchableOpacity
            style={styles.closeBtn}
            hitSlop={{ left: 15, top: 15, right: 15, bottom: 15 }}
            onPress={closeModal}
          >
            <Image source={IMAGES.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};
export default Identity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  contentContainer: {
    padding: 30,
  },
  btnContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  modalContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingTop: 40,
  },
  modalHeading: {
    color: COLORS.black,
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
    marginVertical: 5,
  },
  textInputContainer: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",

    marginVertical: 20,
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  closeIcon: {
    height: 20,
    width: 20,
  },
});

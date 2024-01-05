import React, { useState, useEffect } from 'react';
import Share from 'react-native-share';

import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  TextInput, 
  
} from "react-native";
import { IMAGES } from "../constants/images";
import SButton from "../components/button";
import { Buffer } from "buffer/";
import { dilithiumSign, dilithiumVerifySig, dilithiumGenKeyPair } from '@beechatnetwork/lib-dqx';


import { randomBytes } from "react-native-randombytes";
import { sha256 } from "js-sha256";
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { COLORS } from "../constants/colors";

import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const Identity = (props) => {
  const { navigation } = props;


  const [fileHash, setFileHash] = useState('');
  const [bufferLength, setBufferLength] = useState(0);
  
  useEffect(() => {
    const buffer = Buffer.from(fileHash, 'hex');
    setBufferLength(buffer.length);
    console.log('Buffer length:', buffer.length);
  }, [fileHash]);

  const handleFileInput = async () => {
    try {
      const pickerResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      // Log the picker result to see its structure
      console.log('Picker Result', pickerResult);

      // Assuming we're only picking one file, access the first item in the array
      const uri = pickerResult[0].uri;

      // Check if the URI exists and is a string
      if (uri && typeof uri === 'string') {
        // Android content URI handling
        if (Platform.OS === 'android' && uri.startsWith('content://')) {
          // Create a path for the temporary file copy
          const newFilePath = `${RNFS.CachesDirectoryPath}/${pickerResult[0].name}`;

          // Copy the file from the content URI to the new file path
          await RNFS.copyFile(uri, newFilePath);

          // Read the file content as base64
          const fileContent = await RNFS.readFile(newFilePath, 'base64');

          // Hash the file content
          const hashedFile = sha256(fileContent);

          // Update state with the hash
          setFileHash(hashedFile);

        }
      } else {
        console.warn('No file URI was found.');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file picker.');
      } else {
        console.error('File Picker Error:', err);
        Alert.alert('Error', 'An error occurred while selecting the file.');
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
        console.log(fileHash);
        const signature = await dilithiumSign({
          secretKey: Buffer.from(secretKey, 'hex'),
          challenge: Buffer.from(fileHash, 'hex'),
        });
        console.log(signature.toString('hex'));
        // Create the JSON object
        const signatureData = {
          signature: signature.toString('hex'),
          challenge: fileHash.toString('hex'),
          publicKey: publicKey.toString('hex')
        };
        // Convert JSON object to string
        const signatureString = JSON.stringify(signatureData);

        // Save the JSON string to a file
        const filename = 'signature.sig';
        const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
        await RNFS.writeFile(path, signatureString, 'utf8');
    
        // Share the file
        const shareOptions = {
          title: 'Share Signature',
          url: `file://${path}`, // Use file URL
          type: 'application/json',
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
        Alert.alert('Error', 'No file selected.');
        return;
      }
  
      // Use the first picked file
      const pickedFile = pickedFiles[0];
      console.log('Picked file:', pickedFile);
  
      const fileContent = await RNFS.readFile(pickedFile.uri, 'utf8');
      const { signature, publicKey, challenge } = JSON.parse(fileContent);
  
      const isValidSignature = await dilithiumVerifySig({
        publicKey: Buffer.from(publicKey, 'hex'),
        challenge: Buffer.from(challenge, 'hex'),
        signature: Buffer.from(signature, 'hex')
      });
      
      // Hash the public key using SHA-256
      const hashedPublicKey = sha256(publicKey);
      console.log("Hashed Public Key:", hashedPublicKey);

      if (isValidSignature) {
        Alert.alert('Verification', 'Valid Signature. Created by ' + hashedPublicKey, [
          { text: "OK", onPress: () => Alert.alert('Original hash', challenge) }
        ]);
      } else {
        Alert.alert('Verification', 'Invalid Signature');
      }
    } catch (err) {
      console.error('Verification Error:', err);
      Alert.alert('Error', 'An error occurred during verification.');
    }
  };
  


  

  const createIdentity = async () => {
    try {
      console.log("Starting key pair generation");
      const { publicKey, secretKey } = await dilithiumGenKeyPair({
        randomBytes: (size) => {
          console.log(`randomBytes called with size: ${size}`);
          return Buffer.from(randomBytes(size));
        },
      });
      console.log("Key pair generated");

      // Hash the public key using SHA-256
      const hashedPublicKey = sha256(publicKey.toString("hex"));
      console.log("Hashed Public Key:", hashedPublicKey);

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




  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={IMAGES.backIcon} style={{ height: 60, width: 60 }} />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Identity</Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.btnContainer}>
          {/* Buttons for Identity actions */}
          <View style={styles.btnContainer}>
            <SButton
              title="Create New Identity"
              onPress={createIdentity} // Referencing the existing createIdentity function
              btnStyle={"normal"}
            />
          </View>

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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 40,
  },
  headerTxt: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: COLORS.white,
    paddingLeft: 10, // Add padding to separate the text from the icon
  },
  btnContainer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

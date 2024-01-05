import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import SButton from "../components/button";
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { sha256 } from "js-sha256";
import { Buffer } from "buffer/";
import { COLORS } from "../constants/colors";
import { IMAGES } from "../constants/images";
import Clipboard from "@react-native-clipboard/clipboard";
import { SCREENS } from "../constants/screens";
const Settings = (props) => {
  const { navigation } = props;
  const [identityHash, setIdentityHash] = React.useState(null);
  const [isWorking, setIsWorking] = React.useState(false);

  React.useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");
        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;
          // Hash the public key using SHA-256
      
          console.log("Hashed Public Key:", hashedPublicKey);
          const hashedPublicKey = sha256(publicKey.toString("hex"))
          setIdentityHash(hashedPublicKey);
        }
      } catch (error) {
        console.error("Error reading secure key store:", error);
      }
    }

    readStoredIdentity();
  }, []);
  const copyIdentityHashToClipboard = () => {
    if (identityHash) {
      Clipboard.setString(identityHash);
      Alert.alert("Copied", "Identity hash copied to clipboard!");
    }
  };

  const handleBack = async () => {
    navigation.goBack();
    // await cancelNfcOperation();
    //         setVerifyResult(false);
    //         setLookupResult(null);
    //         setNfcResult(null);
    //         setViewMode("main");
  };
  const handleIdentityPress = () => {
    navigation.navigate(SCREENS.IDENTITY);
    //  setViewMode("identity")
  };

  const handleGenerateKeyPress = () => {
    navigation.navigate(SCREENS.GENERATEKEYS);
  };
  const handleWriteURLPress = () => {
    navigation.navigate(SCREENS.WRITEURL);
  };

  const handleChangePasswordPress = () => {
    navigation.navigate(SCREENS.CHANGEPASSWORD);
  };
  const handleEraseKeysPress = () => {
    navigation.navigate(SCREENS.ERASKEYS);
  };

  const handleServerSettingsPress = () => {
    navigation.navigate(SCREENS.SERVERSETTINGS);
  };
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity style={{ padding: 40 }} onPress={handleBack}>
          <Image source={IMAGES.backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headingTxt}>Advanced</Text>
      </View>
      <ScrollView>
        <View style={{ padding: 40 }}>
          {identityHash && (
            <TouchableOpacity onPress={copyIdentityHashToClipboard}>
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.hashTxt}>Identity Hash:</Text>
                <Text style={styles.hashTxt}>{identityHash}</Text>
              </View>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Tag management</Text>
          <View style={styles.btnContainer}>
            <SButton
              onPress={handleIdentityPress}
              title={"Identity"}
              btnStyle={"normal"}
            />
          </View>
          <View style={styles.btnContainer}>
            <SButton
              onPress={handleGenerateKeyPress}
              title={"Generate keys on tag"}
              disabled={isWorking}
              btnStyle={"normal"}
            />
          </View>
          <View style={styles.btnContainer}>
            <SButton
              onPress={handleWriteURLPress}
              title={"Write URL"}
              btnStyle={"normal"}
            />
          </View>
          <View style={styles.btnContainer}>
            <SButton
              onPress={handleChangePasswordPress}
              title={"Change password"}
              btnStyle={"normal"}
            />
          </View>
          <View style={styles.btnContainer}>
            <SButton
              onPress={handleEraseKeysPress}
              title={"Erase keys on tag"}
              disabled={isWorking}
              btnStyle={"normal"}
            />
          </View>
          <Text style={[styles.label, { marginTop: 30 }]}>
            Server verification
          </Text>
          <View style={styles.btnContainer}>
            <SButton
              onPress={handleServerSettingsPress}
              title={"Edit server settings"}
              btnStyle={"normal"}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
export default Settings;
const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.backgroundColor, flex: 1 },
  backIcon: {
    height: 60,
    width: 60,
  },
  headingTxt: {
    fontSize: 25,
    fontWeight: "bold",
    // letterSpacing: 0.25,
    fontFamily: "monospace",
    color: COLORS.white,
  },
  hashTxt: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 24,
    color: COLORS.white,
  },
  btnContainer: {
    paddingTop: 30,
  },
});

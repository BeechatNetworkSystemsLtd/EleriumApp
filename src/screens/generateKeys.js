import React from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { dqxPerformNFC } from "@beechatnetwork/lib-dqx/rn-api.js";
import { dilithiumVerifySig, generateKeys } from "@beechatnetwork/lib-dqx";

import {
  doLookupTag,
  doRegisterTag,
  doServerAuth,
} from "../services/HttpUtils";
import { sha256 } from "js-sha256";
import { Buffer } from "buffer/";
import SButton from "../components/button";
import styles from "../styles/commonStyles";
import CustomTextInput from "../components/textInput";
import { getString } from "../services/storageUtils";
const GenerateKeys = (props) => {
  const { navigation } = props;
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const [erasePassword, setErasePassword] = React.useState("");
  const [nfcResult, setNfcResult] = React.useState(null);
  const [tagRegistryURL, setTagRegistryURL] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);
  const [lookupResult, setLookupResult] = React.useState(null);
  const [userLogin, setUserLogin] = React.useState("");
  const [userPassword, setUserPassword] = React.useState("");
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
      let rememberedLogin = null;
      try {
        rememberedLogin = await getString("dqxUserLogin");
        console.log("i am storage ", rememberedLogin);
      } finally {
        if (!rememberedLogin) {
          rememberedLogin = "";
        }
      }

      let rememberedPassword = null;

      try {
        rememberedPassword = await getString("dqxUserPassword");
      } finally {
        if (!rememberedPassword) {
          rememberedPassword = "";
        }
      }

      setTagRegistryURL(rememberedURL);
      setUserLogin(rememberedLogin);
      setUserPassword(rememberedPassword);
    }

    readStoredSettings();
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

  const btnProceedAction = async () => {
    if (erasePassword.length < 3) {
      Alert.alert("Erase password must have at least 3 characters!");
      return;
    }

    let result = null;

    setWorkStatusMessage("PLEASE TAP TAG");
    setIsWorking(true);

    try {
      result = await dqxPerformNFC(
        generateKeys,
        { setWorkStatusMessage },
        { erasePassword }
      );
      setNfcResult(result);

      if (tagRegistryURL && userLogin && userPassword) {
        let token = await doServerAuth({
          serverAddr: tagRegistryURL,
          email: userLogin,
          password: userPassword,
        });

        await doRegisterTag({
          serverAddr: tagRegistryURL,
          accessToken: token,
          tagData: {
            hash: sha256(result.publicKey),
            json: [
              {
                name: "DQX Tag Example",
                public_key: Buffer.from(result.publicKey).toString("hex"),
                hash: sha256(result.publicKey),
              },
            ],
          },
        });
        Alert.alert(
          "Done, generated a new key and registered with the server."
        );
      } else {
        Alert.alert("Done, generated a new key.");
      }
    } catch (e) {
      if (e.message) {
        Alert.alert("Error!", e.message);
      } else {
        Alert.alert("Communication error!");
      }
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.descriptiveTxt}>
          {
            "Please enter password to protect the tag. You will not be able to erase the key without knowing the password."
          }
        </Text>
        <View>
          <Text style={styles.inputLabel}>{"New password:"}</Text>
          <CustomTextInput
            secureTextEntry={true}
            onChangeText={setErasePassword}
            value={erasePassword}
            editable={!isWorking}
          />
        </View>
        <View style={styles.btnContainer}>
          <SButton
            onPress={() => btnProceedAction()}
            title={isWorking ? workStatusMessage : "GENERATE KEYS"}
            disabled={isWorking}
            btnStyle={isWorking ? "working" : "normal"}
          />
        </View>
        <View style={styles.btnContainer}>
          <SButton
            onPress={() => navigation.goBack()}
            title={"CANCEL"}
            btnStyle={"normal"}
          />
        </View>
      </View>
    </View>
  );
};
export default GenerateKeys;

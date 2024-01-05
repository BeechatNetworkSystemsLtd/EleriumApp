import React from "react";
import { View, Text, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storeString, getString } from "../services/storageUtils";
import SButton from "../components/button";
import commonStyles from "../styles/commonStyles";
import CustomTextInput from "../components/textInput";
const ServerSettings = (props) => {
  const { navigation } = props;
  const [tagRegistryURL, setTagRegistryURL] = React.useState("");
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
    async function storeSettings() {
      try {
        await storeString("dqxRegistryURL", tagRegistryURL);
        await storeString("dqxUserLogin", userLogin);
        await storeString("dqxUserPassword", userPassword);
      } catch (e) {
        // ignore
      }
    }
    storeSettings();
  }, [tagRegistryURL, userLogin, userPassword]);

  return (
    <View style={commonStyles.container}>
      <View style={{ flex: 0.2 }} />
      <View style={{ padding: 30 }}>
        <View>
          <Text style={commonStyles.label}>Server address</Text>
          <Text style={commonStyles.inputLabel}>
            Tag registry server address:
          </Text>
          <CustomTextInput
            onChangeText={setTagRegistryURL}
            value={tagRegistryURL}
          />
        </View>

        <Text style={[commonStyles.label, { marginTop: 30 }]}>
          Authentication
        </Text>
        <Text style={commonStyles.inputLabel}>
          Leave this section blank if you don't want to create new tags and
          register them with the tag registry server.
        </Text>
        <View>
          <Text style={commonStyles.inputLabel}>User login:</Text>
          <CustomTextInput onChangeText={setUserLogin} value={userLogin} />
        </View>
        <View>
          <Text style={commonStyles.inputLabel}>User password:</Text>
          <CustomTextInput
            onChangeText={setUserPassword}
            value={userPassword}
            secureTextEntry={true}
          />
        </View>

        <View style={commonStyles.btnContainer}>
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
export default ServerSettings;

import React from "react";
import { View, Text, Alert, TextInput } from "react-native";
import { writeURL } from "@beechatnetwork/lib-dqx";
import { dqxPerformNFC } from "@beechatnetwork/lib-dqx/rn-api.js";
import SButton from "../components/button";
import CustomTextInput from "../components/textInput";
import styles from "../styles/commonStyles";
const WriteURL = (props) => {
  const { navigation } = props;
  const [erasePassword, setErasePassword] = React.useState("");
  const [newURL, setNewURL] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const btnProceedAction = async () => {
    if (erasePassword.length < 3) {
      Alert.alert("Erase password must have at least 3 characters!");
      return;
    }
    setWorkStatusMessage("PLEASE TAP TAG");
    setIsWorking(true);
    try {
      await dqxPerformNFC(
        writeURL,
        { setWorkStatusMessage },
        { erasePassword, newURL }
      );
      Alert.alert("Done, modified URL.");
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
        <View>
          <Text style={styles.inputLabel}>New URL to be written:</Text>
          <CustomTextInput
            onChangeText={setNewURL}
            value={newURL}
            editable={!isWorking}
          />
        </View>

        <View style={styles.btnContainer}>
          <SButton
            onPress={() => btnProceedAction()}
            title={isWorking ? workStatusMessage : "WRITE URL"}
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
export default WriteURL;

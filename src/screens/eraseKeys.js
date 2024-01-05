import React from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { eraseKeys } from "@beechatnetwork/lib-dqx";
import { dqxPerformNFC } from "@beechatnetwork/lib-dqx/rn-api.js";
import SButton from "../components/button";
import { COLORS } from "../constants/colors";
import styles from "../styles/commonStyles";
import CustomTextInput from "../components/textInput";
const EraseKeys = (props) => {
  const { navigation } = props;
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const [erasePassword, setErasePassword] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);

  const btnProceedAction = async () => {
    if (erasePassword.length < 3) {
      Alert.alert("Erase password must have at least 3 characters!");
      return;
    }
    setWorkStatusMessage("PLEASE TAP TAG");
    setIsWorking(true);

    try {
      await dqxPerformNFC(
        eraseKeys,
        { setWorkStatusMessage },
        { erasePassword }
      );
      Alert.alert("Done, erased keys.");
    } catch (e) {
      if (e.message) {
        Alert.alert("Error!", e.message);
      } else {
        Alert.alert("Communication error!");
      }
    }

    setErasePassword("");
    navigation.goBack();
    // setNfcResult(null);
    // setIsWorking(false);
    // setViewMode("create");
  };
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.descriptiveTxt}>
          {
            "Please enter erase password. This is the password that you have created upon key generation."
          }
        </Text>
        <View>
          <Text style={styles.inputLabel}>{"Current password:"}</Text>
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
            title={isWorking ? workStatusMessage : "Erase keys on tag"}
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
export default EraseKeys;

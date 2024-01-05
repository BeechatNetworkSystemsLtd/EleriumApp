import React from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { changePassword } from "@beechatnetwork/lib-dqx";
import { dqxPerformNFC } from "@beechatnetwork/lib-dqx/rn-api.js";
import SButton from "../components/button";
import { COLORS } from "../constants/colors";
import styles from "../styles/commonStyles";
import CustomTextInput from "../components/textInput";
const ChangePassword = (props) => {
  const { navigation } = props;
  const [workStatusMessage, setWorkStatusMessage] = React.useState("");
  const [erasePassword, setErasePassword] = React.useState("");
  const [isWorking, setIsWorking] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [isNewPassword, setIsNewPassword] = React.useState(false);
  const btnProceedAction = async () => {
    if (erasePassword.length < 3) {
      Alert.alert("Erase password must have at least 3 characters!");
      return;
    }

    if (!isNewPassword) {
      setOldPassword(erasePassword);
      setErasePassword("");
      setIsNewPassword(true);
      return;
    }
    setWorkStatusMessage("PLEASE TAP TAG");
    setIsWorking(true);

    try {
      await dqxPerformNFC(
        changePassword,
        { setWorkStatusMessage },
        { oldPassword, erasePassword }
      );
      Alert.alert("Done, changed password.");
    } catch (e) {
      if (e.message) {
        Alert.alert("Error!", e.message);
      } else {
        Alert.alert("Communication error!");
      }
    }
    navigation.goBack();
  };

  let actionTxt = isNewPassword
    ? "Please enter the new password. You will not be able to erase the key without knowing the password."
    : "Please enter the current password. This is the password that you have created upon key generation.";

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.descriptiveTxt}>{actionTxt}</Text>
        <View>
          <Text style={styles.inputLabel}>
            {isNewPassword ? "New password" : "Old password:"}
          </Text>
          <CustomTextInput
            secureTextEntry={true}
            onChangeText={setErasePassword}
            value={erasePassword}
            editable={!isWorking}
          />
        </View>

        <View style={{ paddingTop: 15 }}>
          <SButton
            onPress={() => btnProceedAction()}
            title={
              isWorking
                ? workStatusMessage
                : isNewPassword
                ? "CHANGE PASSWORD"
                : "NEXT"
            }
            disabled={isWorking}
            btnStyle={isWorking ? "working" : "normal"}
          />
        </View>
        <View style={{ paddingTop: 15 }}>
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
export default ChangePassword;

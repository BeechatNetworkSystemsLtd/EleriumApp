import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import SButton from "./button";
import CustomTextInput from "./textInput";
const HasNFTSolanaAccount = ({ onClose, onEnterNFTPublicKey }) => {
  const [enteredPublicKey, setEnteredPublicKey] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleEnterPublicKey = () => {
    onEnterNFTPublicKey(enteredPublicKey);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.headingTxt}>
        {showInput
          ? "Enter/Paste Solana public key"
          : "Do you have Solana Public key?"}
      </Text>
      {showInput && (
        <CustomTextInput
          onChangeText={setEnteredPublicKey}
          value={enteredPublicKey}
          customStyle={styles.input}
          placeholder={"Enter Solana Public Key"}
        />
      )}

      <View style={styles.btnContainer}>
        <View style={styles.btn}>
          <SButton title={"No"} onPress={onClose} />
        </View>
        <View style={styles.btn}>
          <SButton
            title={"Yes"}
            onPress={() =>
              showInput ? handleEnterPublicKey() : setShowInput(true)
            }
          />
        </View>
      </View>
    </View>
  );
};
export default HasNFTSolanaAccount;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.secondary,
    borderWidth: 3,
  },
  headingTxt: {
    // fontFamily: "monospace",
    fontWeight: "bold",
    color: COLORS.black,
    fontSize: 18,
  },
  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 40,
    // borderTopWidth: 1,
    // borderColor: COLORS.backgroundColor,
    // paddingTop: 20,
  },
  btn: {
    width: "40%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    width: "100%",
    marginTop: 40,
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  LockClosedIcon,
  IdentificationIcon,
} from "react-native-heroicons/outline";
import { MotiView, MotiText } from "moti"; // Moti is Framer Motion for React Native
import { IMAGES } from "../constants/images";
import { COLORS } from "../constants/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const { height, width } = Dimensions.get("window");

export default function ActivateChipForm() {
  const [adminPassword, setAdminPassword] = useState("");
  const [mintId, setMintId] = useState("");

  const handleSubmit = () => {
    // Handle form submission here
    console.log("Admin Password:", adminPassword);
    console.log("Mint ID:", mintId);
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 500 }}
          style={styles.card}
        >
          <Image source={IMAGES.activeChipICon} style={styles.logo} />
          <MotiText
            style={styles.title}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Activate Your Chip
          </MotiText>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Admin Password</Text>
              <View style={styles.inputWrapper}>
                <LockClosedIcon style={styles.icon} />
                <TextInput
                  secureTextEntry
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                  style={styles.input}
                  placeholder="Enter your password"
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mint ID</Text>
              <View style={styles.inputWrapper}>
                <IdentificationIcon style={styles.icon} />
                <TextInput
                  value={mintId}
                  onChangeText={setMintId}
                  style={styles.input}
                  placeholder="Enter your Mint ID"
                />
              </View>
              <Text style={styles.hint}>
                You should have received instructions about your Mint ID. If
                not, please email gm@streetmint.xyz
              </Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <MotiText
                style={styles.buttonText}
                animate={{ scale: 1.05 }}
                transition={{ duration: 200 }}
              >
                Activate Chip
              </MotiText>
            </TouchableOpacity>
          </View>
        </MotiView>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    height,
    width,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: -80,
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },

  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    // color: "#555",
    marginBottom: 4,
    color: COLORS.black,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: "#777777",
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  icon: {
    marginRight: 8,
    color: "#888",
  },
  hint: {
    fontSize: 12,
    color: "#404040",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

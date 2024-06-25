import React from "react";
import { SafeAreaView } from "react-native";
import RootStack from "./src/navigator/rootStack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "./src/constants/colors";
import Toast from "react-native-toast-message";

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundColor }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootStack />
        <Toast />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default App;

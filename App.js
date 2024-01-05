import React from "react";
import { SafeAreaView } from "react-native";
import RootStack from "./src/navigator/rootStack";

import { COLORS } from "./src/constants/colors";
const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundColor }}>
      <RootStack />
    </SafeAreaView>
  );
};

export default App;

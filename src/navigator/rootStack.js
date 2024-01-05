import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "../screens/main";
import Identity from "../screens/identity";
import GenerateKeys from "../screens/generateKeys";
import WriteURL from "../screens/writeUrl";
import ChangePassword from "../screens/changePassword";
import EraseKeys from "../screens/eraseKeys";
import ServerSettings from "../screens/serverSettings";

import { SCREENS } from "../constants/screens";
import Settings from "../screens/settings";

const {
  MAIN,
  SETTINGS,
  IDENTITY,
  GENERATEKEYS,
  WRITEURL,
  CHANGEPASSWORD,
  ERASKEYS,
  SERVERSETTINGS,
} = SCREENS;

const RootStack = () => {
  const MainStack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <MainStack.Navigator
        initialRouteName={MAIN}
        screenOptions={{ headerShown: false }}
      >
        <MainStack.Screen component={Main} name={MAIN} />
        <MainStack.Screen component={Settings} name={SETTINGS} />
        <MainStack.Screen component={Identity} name={IDENTITY} />
        <MainStack.Screen component={GenerateKeys} name={GENERATEKEYS} />
        <MainStack.Screen component={WriteURL} name={WRITEURL} />
        <MainStack.Screen component={ChangePassword} name={CHANGEPASSWORD} />
        <MainStack.Screen component={EraseKeys} name={ERASKEYS} />
        <MainStack.Screen component={ServerSettings} name={SERVERSETTINGS} />
      </MainStack.Navigator>
    </NavigationContainer>
  );
};
export default RootStack;

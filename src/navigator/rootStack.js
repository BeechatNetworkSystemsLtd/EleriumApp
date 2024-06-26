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
import RegisterTag from "../screens/registerTag";
import PdfViewer from "../screens/fileViewer";
import MyCreatedAssets from "../screens/myCreatedAssets";

const {
  MAIN,
  SETTINGS,
  IDENTITY,
  GENERATEKEYS,
  WRITEURL,
  CHANGEPASSWORD,
  ERASKEYS,
  SERVERSETTINGS,
  REGISTER_TAGS,
  PDF_VIEWER,
  MY_CREATED_ASSETS,
} = SCREENS;

const RootStack = () => {
  const MainStack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <MainStack.Navigator
        initialRouteName={MAIN}
        // initialRouteName={REGISTER_TAGS}
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        <MainStack.Screen component={Main} name={MAIN} />
        <MainStack.Screen component={Settings} name={SETTINGS} />
        <MainStack.Screen component={Identity} name={IDENTITY} />
        <MainStack.Screen component={GenerateKeys} name={GENERATEKEYS} />
        <MainStack.Screen component={WriteURL} name={WRITEURL} />
        <MainStack.Screen component={ChangePassword} name={CHANGEPASSWORD} />
        <MainStack.Screen component={EraseKeys} name={ERASKEYS} />
        <MainStack.Screen component={ServerSettings} name={SERVERSETTINGS} />
        <MainStack.Screen component={RegisterTag} name={REGISTER_TAGS} />
        <MainStack.Screen component={PdfViewer} name={PDF_VIEWER} />
        <MainStack.Screen
          component={MyCreatedAssets}
          name={MY_CREATED_ASSETS}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
};
export default RootStack;

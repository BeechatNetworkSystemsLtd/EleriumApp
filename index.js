/**
 * @format
 */
import "react-native-gesture-handler";
import "./shim.js";
import crypto from "crypto";
import App from "./App";
import { name as appName } from "./app.json";
// import TrackPlayer from "react-native-track-player";
import { playbackService } from "./musicPlayerServices";
import { AppRegistry, Text, TextInput } from "react-native";

if (Text.defaultProps == null) {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

AppRegistry.registerComponent(appName, () => App);
// TrackPlayer.registerPlaybackService(() => playbackService);

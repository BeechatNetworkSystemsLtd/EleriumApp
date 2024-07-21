import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  heightPercentageToDP as h,
  widthPercentageToDP as w,
} from "react-native-responsive-screen";
import VideoPlayer from "react-native-video-player";
import { COLORS } from "../constants/colors";
import RNFS from "react-native-fs";

const SingleVideoModal = ({ file }) => {
  const [filePath, setFilePath] = useState(null);

  const player = useRef(null);
  let base64String = file.base64_data;

  const writeBase64ToFile = async (base64String, filename) => {
    const path = `${RNFS.CachesDirectoryPath}/${filename}`;
    try {
      await RNFS.writeFile(path, base64String, "base64");
      return path;
    } catch (error) {
      console.error("Error writing base64 to file:", error);
      throw error;
    }
  };

  useEffect(() => {
    getPath();
  }, []);

  const getPath = async () => {
    let path = await writeBase64ToFile(base64String, file.file_name);
    setFilePath(path);
  };

  return (
    <View style={styles.qrScannerModalView}>
      {filePath && (
        <VideoPlayer
          video={{
            //   uri: `data:video/mp4;base64,${base64String}`,
            // uri: "https://vjs.zencdn.net/v/oceans.mp4",
            uri: filePath,
          }}
          ref={player}
          videoWidth={w("90%")}
          videoHeight={Platform.OS === "ios" ? h("30%") : h("58%")}
          showDuration
          playInBackground={false}
          disableControlsAutoHide
          resizeMode="contain"
          customStyles={styles.videoPlayerCustomStyles}
          fullscreen={false}
          disableFullscreen
          onError={(error) => console.log("error on video loading", error)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  qrScannerModalView: {
    width: w(100),
    height: Platform.OS === "ios" ? h(37) : h(82),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignSelf: "center",
  },
  videoPlayerCustomStyles: {
    video: {
      borderRadius: 0,
      height: Platform.OS === "ios" ? h("30%") : h("58%"),
    },
    controls: {
      backgroundColor: COLORS.white,
      width: "100%",
      marginTop: h("0%"),
      height: h("6%"),
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    playControl: {
      backgroundColor: COLORS.white,
      borderRadius: 10,
    },
    controlButton: {
      backgroundColor: COLORS.white,
      borderRadius: 10,
    },
    controlIcon: { color: COLORS.black, borderRadius: 10 },
    playIcon: {
      backgroundColor: COLORS.white,
      borderRadius: 10,
    },
    // durationText: {
    //   color: COLORS.black,
    // },
    seekBar: { backgroundColor: COLORS.white },
    seekBarFullWidth: {},
    seekBarProgress: { backgroundColor: COLORS.borderColor },
    seekBarKnob: { backgroundColor: COLORS.borderColor },
    seekBarBackground: { backgroundColor: "grey" },
    thumbnail: {
      backgroundColor: "#F7F7F7",
      borderRadius: 10,
      width: "100%",
      resizeMode: "stretch",
      height: h("30%"),
    },
    videoWrapper: {
      borderRadius: 10,
    },
    playButton: {
      backgroundColor: COLORS.borderColor,
      height: h("7%"),
      width: h("7%"),
    },
  },
});
export default SingleVideoModal;

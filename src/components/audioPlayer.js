import React, { useEffect, useRef } from "react";
import { Button, View, Alert } from "react-native";
import Sound from "react-native-sound";
import RNFS from "react-native-fs";

const Base64AudioPlayer = ({ file }) => {
  let base64String = file.base64_data;
  const soundRef = useRef(null);
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
    const loadAudio = async () => {
      try {
        const filePath = await writeBase64ToFile(base64String, file.file_name);
        const sound = new Sound(filePath, "", (error) => {
          if (error) {
            console.error("Failed to load sound", error);
            Alert.alert("Error", "Failed to load sound");
            return;
          }
          soundRef.current = sound;
        });
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, [base64String]);

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.play((success) => {
        if (success) {
          console.log("Successfully finished playing");
        } else {
          console.error("Playback failed due to audio decoding errors");
          Alert.alert("Error", "Playback failed");
        }
      });
    }
  };

  return (
    <View>
      <Button title="Play Audio" onPress={playSound} />
    </View>
  );
};

export default Base64AudioPlayer;

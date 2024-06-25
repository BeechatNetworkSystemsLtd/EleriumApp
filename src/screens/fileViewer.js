import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";
import ImageViewer from "../components/ImageViewer";
import SingleVideoModal from "../components/VideoPlayer";
import AudioPlayer from "../components/audioPlayer";
import PDFViewer from "../components/pdfViewer";
//
const FileViewer = ({ data }) => {
  return (
    <View style={{}}>
      {data?.mime_type?.split("/")[0] == "image" && <ImageViewer file={data} />}
      {data?.mime_type?.split("/")[0] == "application" && (
        <PDFViewer file={data} />
      )}
      {data?.mime_type?.split("/")[0] == "video" && (
        <SingleVideoModal file={data} />
      )}

      {data?.mime_type?.split("/")[0] == "audio" && <AudioPlayer file={data} />}
    </View>
  );
};

export default FileViewer;
const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.backgroundColor, flex: 1 },
  pdfStyle: {
    flex: 1,
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height,
    alignSelf: "center",
    borderRadius: 8,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 40,
    marginBottom: 10,
  },
  backIcon: {
    height: 60,
    width: 60,
  },
  headingTxt: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: COLORS.white,
    marginLeft: 40,
  },
});

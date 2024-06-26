import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";
const PDFViewer = ({ file }) => {
  let base64String = file.base64_data;
  return (
    <View style={styles.pdfContainer}>
      <Pdf
        style={styles.pdfStyle}
        source={{
          uri: `data:application/pdf;base64,${base64String}`,
          // uri: "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
          cache: true,
        }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        onPressLink={(uri) => {
          console.log(`Link pressed: ${uri}`);
        }}
      />
    </View>
  );
};
export default PDFViewer;

const styles = StyleSheet.create({
  pdfContainer: {
    // flex: 0.4,

    // height: 300,
    // width: 300,
    marginTop: 10,
  },
  pdfStyle: {
    // flex: 1,
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height,
    alignSelf: "center",
    borderRadius: 8,
  },
});

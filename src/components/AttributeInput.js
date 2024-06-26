import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { COLORS } from "../constants/colors";
import { IMAGES } from "../constants/images";
import { types } from "react-native-document-picker";
const AttributeInput = (props) => {
  let fileIcon = IMAGES.image;

  if (props?.selectedFileType)
    fileIcon = props?.selectedFileType?.includes(types.images)
      ? IMAGES.image
      : props?.selectedFileType?.includes(types.video)
      ? IMAGES.video
      : props?.selectedFileType?.includes(types.audio)
      ? IMAGES.audio
      : IMAGES.pdf;
  else if (props.attachedFile) {
    fileIcon =
      props?.attachedFile?.mime_type?.mime_type?.split("/")[0] == "image"
        ? IMAGES.image
        : props?.attachedFile?.mime_type?.split("/")[0] == "video"
        ? IMAGES.video
        : props?.attachedFile?.mime_type?.split("/")[0] == "audio"
        ? IMAGES.audio
        : IMAGES.pdf;
  }

  return (
    <>
      <View style={styles.mainView}>
        <View
          style={{
            flexDirection: "row",
            width: 304,
            borderWidth: 2,
            elevation: 3,
            borderColor: COLORS.borderColor,
            borderRadius: 9,
          }}
        >
          <TextInput
            secureTextEntry={props.secureTextEntry}
            onChangeText={props.onChangeAttributeText}
            value={props.attributeValue}
            placeholder={"Enter Attribute"}
            placeholderTextColor={COLORS.placeholderColor}
            style={[styles.style, { ...props.customStyle }]}
            editable={props.editable}
          />
          <TextInput
            secureTextEntry={props.secureTextEntry}
            onChangeText={props.onChangeValueText}
            value={props.value}
            placeholderTextColor={COLORS.placeholderColor}
            placeholder={"Enter Value"}
            style={[
              styles.style,
              {
                ...props.customStyle,
                borderTopRightRadius: 7,
                borderBottomRightRadius: 7,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeftWidth: 1,
              },
            ]}
            editable={props.editable}
          />
        </View>
        <TouchableOpacity
          style={styles.iconView}
          onPress={
            props.length === props?.index + 1 ? props.onAdd : props.onMinus
          }
        >
          <Image
            source={
              props.length === props?.index + 1
                ? IMAGES.addIcon
                : IMAGES.minusIcon
            }
            style={{ height: 35, width: 35, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>
      {props.length === props?.index + 1 && (
        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            marginTop: 10,
            marginLeft: 10,
            // failureIcon
          }}
        >
          {props?.selectedFile || props.attachedFile ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "70%",
                marginTop: 10,
                borderWidth: 2,
                borderColor: COLORS.borderColor,
                padding: 6,
                borderRadius: 9,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.optionImgContainer,
                  { position: "absolute", right: -15, top: -15 },
                ]}
                onPress={props?.onClearSelectedFile}
              >
                <Image
                  source={IMAGES.failureIcon}
                  style={{ height: "75%", width: "75%" }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.optionImgContainer}>
                <Image
                  source={fileIcon}
                  style={styles.optionImg}
                  resizeMode="contain"
                />
              </View>
              {props.attachedFile ? (
                <Text
                  style={{ color: "#fff", marginLeft: 10, maxWidth: "80%" }}
                  numberOfLines={1}
                >
                  {props?.attachedFile?.name || props?.attachedFile?.file_name}
                </Text>
              ) : (
                <Text
                  style={{ color: "#fff", marginLeft: 10, maxWidth: "80%" }}
                  numberOfLines={1}
                >
                  {props?.selectedFile?.name || props?.selectedFile?.fileName}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={{ alignSelf: "center" }}
              onPress={props.onAddFile}
            >
              <Image
                source={IMAGES.chooseFile}
                style={{ height: 30, width: 100, resizeMode: "contain" }}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};
export default AttributeInput;

const styles = StyleSheet.create({
  mainView: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 10,
  },
  style: {
    backgroundColor: COLORS.white,
    color: COLORS.black,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    fontSize: 16,
    paddingHorizontal: 10,
    height: 50,
    width: 150,
  },
  iconView: {
    height: 53,
    width: "15%",
    alignItems: "center",
    justifyContent: "center",
  },
  optionImgContainer: {
    height: 34,
    width: 34,
    borderRadius: 60,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionImg: {
    height: "50%",
    width: "50%",
  },
});

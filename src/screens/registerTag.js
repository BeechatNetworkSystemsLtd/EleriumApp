import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { pick, types } from "react-native-document-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { setupPlayer } from "../../musicPlayerServices";
import AttributeInput from "../components/AttributeInput";
import SButton from "../components/button";
import { COLORS } from "../constants/colors";
import { IMAGES } from "../constants/images";
import { SCREENS } from "../constants/screens";
import { addingMetadata, updatingMetadata } from "../services/HttpUtils";
import RNFS from "react-native-fs";
import axios from "axios";
import { Buffer } from "buffer/";
import { bytesToHex } from "../services/helpers";
import { launchImageLibrary } from "react-native-image-picker";
import { sha256 } from "js-sha256";
import Toast from "react-native-toast-message";
import RNSecureKeyStore, { ACCESSIBLE } from "react-native-secure-key-store";
import { dilithiumGenKeyPair, dilithiumSign } from "@beechatnetwork/lib-dqx";
import { randomBytes } from "react-native-randombytes";
import DeviceInfo from "react-native-device-info";

const RegisterTag = (props) => {
  const { navigation } = props;
  const from = props?.route?.params?.from;

  const { nfcResult } = props.route.params;
  const ref_bottomSheet = useRef(null);
  const snapPoints = useMemo(() => [0.1, 160], []);
  const [tagsData, setTagsData] = useState([{ attribute: "", value: "" }]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [showShadow, setShowShadow] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [identityHash, setIdentityHash] = React.useState(null);
  const [identitySecret, setIdentitySecret] = React.useState(null);
  const [nfcPublicKey, setnfcPublicKey] = React.useState("");

  const handleAttributeChange = (text, index) => {
    const newData = [...tagsData];
    newData[index].attribute = text;
    setTagsData(newData);
  };

  const handleValueChange = (text, index) => {
    const newData = [...tagsData];
    newData[index].value = text;
    setTagsData(newData);
  };

  const convertToBase64 = async (selectedFile) => {
    if (!selectedFile) return null;
    return await RNFS.readFile(selectedFile?.uri, "base64");
  };

  React.useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");

        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;

          const hashedPublicKey = sha256(Buffer.from(publicKey, "hex"));
          setIdentityHash(publicKey);
          setIdentitySecret(keypair.secretKey);
        } else {
          //create identity if not already existes
          // createIdentity();
        }
      } catch (error) {
        createIdentity();
        console.error("Error reading secure key store:", error);
      }
    }

    readStoredIdentity();
  }, []);

  const createIdentity = async () => {
    try {
      const { publicKey, secretKey } = await dilithiumGenKeyPair({
        randomBytes: (size) => {
          return Buffer.from(randomBytes(size));
        },
      });

      // const hashedPublicKey = sha256(Buffer.from(publicKey, "hex"));
      // setIdentityHash(hashedPublicKey);

      // Save the keypair securely
      const keypair = JSON.stringify({
        publicKey: publicKey.toString("hex"),
        secretKey: secretKey.toString("hex"),
      });

      setIdentityHash(publicKey.toString("hex"));
      setIdentitySecret(secretKey.toString("hex"));
      await RNSecureKeyStore.set("dilithiumKeypair", keypair, {
        accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      console.error("Error in createIdentity:", error);
      Alert.alert(
        "Error",
        `Failed to create identity: ${error.message || error.toString()}`
      );
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (!from) return;
    let metadata2 = props.route.params.EDIData?.metadata2;
    if (metadata2.hasOwnProperty("file")) {
      setAttachedFile(metadata2.file);
      delete metadata2.file;
    }
    if (metadata2.hasOwnProperty("identityHash")) {
      delete metadata2.identityHash;
    }
    if (metadata2.hasOwnProperty("nfcPublickey")) {
      setnfcPublicKey(metadata2.nfcPublickey);
      delete metadata2.nfcPublickey;
    }

    const arrayOfObjects = Object.entries(metadata2).map(([key, value]) => {
      return { attribute: key, value: value };
    });

    setTagsData(arrayOfObjects);
  }, []);

  //handle register tags
  const _handleRegisterTag = async (url) => {
    let deviceID = await DeviceInfo.getUniqueId();

    let base64_data = await convertToBase64(selectedFile);
    const metadata = tagsData.reduce((acc, curr) => {
      if (selectedFile) {
        acc["file"] = {
          file_name: selectedFile?.name || selectedFile?.fileName,
          mime_type: selectedFile?.type,
          file_size: selectedFile?.fileSize / 1024,
          base64_data,
        };
      }
      if (identityHash) {
        acc["identityHash"] = deviceID;
      }
      acc[curr.attribute] = curr.value;
      acc["nfcPublickey"] = nfcResult.publicKey;

      return acc;
    }, {});

    let metadata2 = JSON.stringify({
      metadata1: bytesToHex(nfcResult.publicKey),
      metadata2: { ...metadata },
    });

    let headers = {
      publicKey: identityHash, //user public key
      challenge: sha256(nfcResult.publicKey),
      signature: bytesToHex(
        await dilithiumSign({
          secretKey: identitySecret, //user secret key
          challenge: Buffer.from(sha256(nfcResult.publicKey), "hex"),
        })
      ),
      "Content-Type": "application/json",
    };
    addingMetadata(url, metadata2, headers)
      .then((res) => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Tag successfully created",
          topOffset: 70,
        });
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      })
      .catch((error) => {
        console.log("error on add  ", error?.message);
        let otherURL = "http://159.65.54.39/"; ///if request fails for previous url then call with new url
        if (otherURL != url) _handleRegisterTag(otherURL);
        else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Something went wrong",
            topOffset: 70,
          });
        }
      });
  };

  const handleEditTag = async (url) => {
    let deviceID = await DeviceInfo.getUniqueId();
    let base64_data = await convertToBase64(selectedFile);

    const metadata = tagsData.reduce((acc, curr) => {
      if (selectedFile) {
        acc["file"] = {
          file_name: selectedFile?.name || selectedFile?.fileName,
          mime_type: selectedFile?.type,
          file_size: selectedFile?.fileSize / 1024,
          base64_data,
        };
      } else if (attachedFile) {
        acc["file"] = attachedFile;
      }
      if (identityHash) {
        acc["identityHash"] = deviceID;
        // acc["identityHash"] = identityHash;
      }
      acc[curr.attribute] = curr.value;
      acc["nfcPublickey"] = nfcPublicKey;
      return acc;
    }, {});

    let metadata2 = JSON.stringify({
      metadata2: { ...metadata },
    });

    let headers = {
      publicKey: identityHash, //user public key
      challenge: sha256(nfcPublicKey),
      signature: bytesToHex(
        await dilithiumSign({
          secretKey: identitySecret, //user secret key
          challenge: Buffer.from(sha256(nfcPublicKey), "hex"),
        })
      ),
      "Content-Type": "application/json",
    };

    updatingMetadata(url, headers, metadata2, sha256(nfcPublicKey))
      .then((res) => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Tag successfully updated",
          topOffset: 70,
        });
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      })
      .catch((error) => {
        let otherURL = "http://159.65.54.39/"; ///if request fails for previous url then call with new url
        if (otherURL != url) handleEditTag(otherURL);
        else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Something went wrong",
            topOffset: 70,
          });
        }
        console.log("error while updating", error);
      });
  };
  const _renderItems = (i, n) => {
    return (
      <AttributeInput
        item={i}
        index={n}
        length={tagsData?.length}
        attributeValue={i?.attribute}
        onChangeAttributeText={(text) => handleAttributeChange(text, n)}
        value={i?.value}
        onChangeValueText={(text) => handleValueChange(text, n)}
        onAddFile={() => ref_bottomSheet.current?.snapToIndex(1)}
        onAdd={() => setTagsData([...tagsData, { attribute: "", value: "" }])}
        onMinus={() => setTagsData(tagsData?.filter((v, index) => index !== n))}
        selectedFile={selectedFile}
        selectedFileType={selectedFileType}
        onClearSelectedFile={() => {
          setSelectedFile(null);
          setSelectedFileType(null);
          setAttachedFile(null);
        }}
        attachedFile={attachedFile}
      />
    );
  };

  const listHeaderComponent = () => {
    return (
      <View style={styles.headingView}>
        <Text style={[styles.headingTxt, { fontSize: 16 }]}>Attribute</Text>
        <Text style={[styles.headingTxt, { fontSize: 16 }]}>Value</Text>
      </View>
    );
  };

  const renderBackdrop = (props) => (
    <BottomSheetBackdrop
      {...props}
      opacity={0.6}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
    />
  );
  const handleSheetChanges = useCallback((index) => {
    if (index == 1) setShowShadow(true);
    else setShowShadow(false);
  }, []);
  const handleFileChoose = async (types) => {
    pick({
      presentationStyle: "fullScreen",
      allowMultiSelection: false,
      type: types,
    })
      .then((res) => {
        if (res[0]?.size > 1048576) {
          ref_bottomSheet.current?.close();
          Alert.alert("File size must be less then 1MB.");
        } else {
          ref_bottomSheet.current?.close();
          setSelectedFile(res[0]);
          setSelectedFileType(types);
          convertFileToBase64(res[0].uri);
        }
      })
      .catch((e) => console.log("ERROR handleFileChoose()", e));
  };

  const convertFileToBase64 = async (fileUri) => {
    try {
      const base64String = await RNFS.readFile(fileUri, "base64");
    } catch (error) {
      console.error(error);
    }
  };

  const [isPlayerReady, setIsPlayerReady] = useState(false);
  async function setupMusicPlayer() {
    let isSetup = await setupPlayer();
    setIsPlayerReady(isSetup);
  }
  useEffect(() => {
    setupMusicPlayer();
  }, []);

  const _imagePickerFromGallery = (fileType) => {
    let options = {
      mediaType: "mixed",
      selectionLimit: 1,
    };
    launchImageLibrary(options, (res) => {
      if (res.didCancel) {
      } else if (res.errorMessage) {
      } else {
        if (res?.assets[0]?.fileSize > 1048576) {
          ref_bottomSheet.current?.close();
          Alert.alert("File size must be less then 1MB.");
        } else {
          ref_bottomSheet.current?.close();
          setSelectedFile(res?.assets[0]);
          setSelectedFileType(fileType);
          convertFileToBase64(res?.assets[0]?.uri);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flex: 1 }}
        scrollEnabled={false}
      >
        <View style={styles.innerContainer}>
          <TouchableOpacity
            style={{ padding: 40 }}
            onPress={() => navigation.goBack()}
          >
            <Image source={IMAGES.backIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headingTxt}>
            {from ? "Edit Tag" : "Register Tag"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            data={tagsData}
            extraData={tagsData}
            stickyHeaderIndices={[0]}
            stickyHeaderHiddenOnScroll={true}
            contentContainerStyle={{ paddingVertical: 10 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={listHeaderComponent}
            renderItem={({ item, index }) => _renderItems(item, index)}
          />
        </View>
        <View style={styles.btnContainer}>
          <SButton
            onPress={
              from
                ? () => handleEditTag("http://138.68.190.112/")
                : () => _handleRegisterTag("http://138.68.190.112/")
            }
            title={from ? "Update Tag" : "Register Tag"}
          />
        </View>

        <View style={styles.settingIconContainer}>
          <TouchableOpacity>
            <Image source={IMAGES.settingIcon} style={styles.settingsIcon} />
          </TouchableOpacity>
        </View>

        <BottomSheet
          ref={ref_bottomSheet}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onChange={handleSheetChanges}
          containerHeight={160}
          backgroundStyle={[
            styles.bottomSheetBackgroundStyle,
            showShadow && {
              shadowColor: COLORS.borderColor,
              shadowOpacity: 0.5,
              shadowRadius: 5,
            },
          ]}
          handleIndicatorStyle={{ backgroundColor: COLORS.borderColor }}
          backdropComponent={renderBackdrop}
        >
          <Text style={styles.txtChoose}>Choose from gallery</Text>
          <View style={styles.optionsContainer}>
            {[
              { title: "Image", img: IMAGES.image },
              { title: "Video", img: IMAGES.video },
              { title: "Audio", img: IMAGES.audio },
              { title: "PDF", img: IMAGES.pdf },
            ].map((item, index) => (
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => {
                  let fileTypes =
                    item?.title == "Image"
                      ? [types.images]
                      : item?.title == "Video"
                      ? [types.video]
                      : item?.title == "Audio"
                      ? [types.audio]
                      : [types.pdf];

                  if (item?.title == "Image" || item?.title == "Video") {
                    _imagePickerFromGallery(fileTypes);
                  } else {
                    handleFileChoose(fileTypes);
                  }
                }}
              >
                <View style={styles.optionImgContainer}>
                  <Image
                    source={item?.img}
                    style={styles.optionImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.txtChooseOption}>{item?.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheet>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default RegisterTag;
const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.backgroundColor, flex: 1 },
  backIcon: {
    height: 60,
    width: 60,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headingTxt: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: COLORS.white,
  },
  hashTxt: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 24,
    color: COLORS.white,
  },
  btnContainer: {
    flex: 0.15,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  settingIconContainer: {
    flex: 0.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 30,
  },
  settingsIcon: {
    height: 80,
    width: 80,
  },
  headingView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 200,
    marginLeft: 50,
  },
  bottomSheetBackgroundStyle: {
    backgroundColor: COLORS.backgroundColor,
  },
  txtChoose: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
    // borderWidth: 1,
    // borderColor: "#fff",
  },
  optionImgContainer: {
    height: 65,
    width: 65,
    borderRadius: 60,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionImg: {
    height: "50%",
    width: "50%",
  },
  txtChooseOption: {
    marginTop: 3,
    fontSize: 14,
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "700",
  },
});

import React, { useState } from "react";
import {} from "react-native";
import { bytesToHex } from "../services/helpers";
import { sha256 } from "js-sha256";
import { removingMetadata, retrievingMetadata } from "../services/HttpUtils";
const MyAssetComponent = () => {
  const [nfcResult, setNfcResult] = React.useState(null);
  const [isError, setIsError] = useState(false);
  const [identityHash, setIdentityHash] = React.useState(null);

  React.useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get("dilithiumKeypair");
        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;
          //   const hashedPublicKey = sha256(Buffer.from(publicKey, "hex"));
          setIdentityHash(publicKey);
        }
      } catch (error) {
        console.error("Error reading secure key store:", error);
      }
    }

    readStoredIdentity();
  }, []);

  const _retrieveDataFromEDI = (url) => {
    retrievingMetadata(url, (headers = {}), sha256(identityHash))
      .then((res) => {
        if (res?.data == "" || res?.data == null) {
          props.navigation.navigate(SCREENS.REGISTER_TAGS, {
            nfcResult: nfcResult,
          });
        } else {
          setEDIdata(res?.data?.data);
          setIsEDIData(true);
          verifyTagOwner();
        }
      })
      .catch((error) => {
        let otherURL = "http://159.65.54.39/";
        if (url != otherURL) {
          _retrieveDataFromEDI(otherURL);
        } else {
          setIsEDIData(false);
          setEDIdata(null);
        }
      });
  };

  const onDeleteMetaData2 = async (url) => {
    let headers = {
      publickey: bytesToHex(nfcResult?.publicKey),
      challenge: bytesToHex(nfcResult?.challenge),
      signature: bytesToHex(nfcResult?.signature),
    };
    removingMetadata(url, headers, sha256(nfcResult.publicKey))
      .then(() => {
        setEDIdata(null);
        isEDIData(false);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Tag deleted successfully",
          topOffset: 70,
        });
      })
      .catch((error) => {
        let otherURL = "http://159.65.54.39/";
        if (url != otherURL) {
          onDeleteMetaData2(otherURL);
        } else {
          setIsEDIData(false);
          setEDIdata(null);
        }
      });
    return;
  };
  return;
};
export default MyAssetComponent;

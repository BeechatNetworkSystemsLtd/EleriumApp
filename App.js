import crypto from 'crypto';
import { createHash } from 'crypto';
import { randomBytes } from 'react-native-randombytes'; 
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store';

import {Buffer} from 'buffer/';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NfcManager from 'react-native-nfc-manager';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  dilithiumGenKeyPair,
  dilithiumSign,
  dilithiumVerifySig,
  changePassword,
  eraseKeys,
  generateKeys,
  signChallenge,
  writeURL,
} from '@beechatnetwork/lib-dqx';
import {dqxPerformNFC} from '@beechatnetwork/lib-dqx/rn-api.js';

import {bytesToHex} from './Util';
import SButton from './SButton';
import {doLookupTag, doRegisterTag, doServerAuth} from './API';
import {sha256} from 'js-sha256';

const App = () => {
  const [supported, setSupported] = React.useState(null);
  const [enabled, setEnabled] = React.useState(null);
  const [isWorking, setIsWorking] = React.useState(false);
  const [workStatusMessage, setWorkStatusMessage] = React.useState('');
  const [currentAction, setCurrentAction] = React.useState('');
  const [nfcResult, setNfcResult] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('main');


  const [erasePassword, setErasePassword] = React.useState('');
  const [oldPassword, setOldPassword] = React.useState('');
  const [newURL, setNewURL] = React.useState('');

  const [identityHash, setIdentityHash] = React.useState(null);


  const [tagRegistryURL, setTagRegistryURL] = React.useState('');
  const [userLogin, setUserLogin] = React.useState('');
  const [userPassword, setUserPassword] = React.useState('');

  const [challenge, setChallenge] = React.useState(null);
  const [verifyResult, setVerifyResult] = React.useState(null);
  const [lookupResult, setLookupResult] = React.useState(null);
  
  const copyIdentityHashToClipboard = () => {
    if (identityHash) {
      Clipboard.setString(identityHash);
      Alert.alert('Copied', 'Identity hash copied to clipboard!');
    }
  };


  const createIdentity = async () => {
    try {
      console.log("Starting key pair generation");
      const { publicKey, secretKey } = await dilithiumGenKeyPair({
        randomBytes: (size) => {
          console.log(`randomBytes called with size: ${size}`);
          return Buffer.from(randomBytes(size));
        }
      });
      console.log("Key pair generated");
  
      // Hash the public key using SHA-256
      const hashedPublicKey = sha256(publicKey);
      console.log("Hashed Public Key:", hashedPublicKey);
  
      // Save the keypair securely
      const keypair = JSON.stringify({ publicKey: publicKey.toString('hex'), secretKey: secretKey.toString('hex') });
      await RNSecureKeyStore.set('dilithiumKeypair', keypair, { accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
      console.log("Saved to Secure Key Store");


      setIdentityHash(hashedPublicKey);

      Alert.alert('Identity Created', 'Your Dilithium keypair has been successfully generated and saved securely. Your hash: ' + hashedPublicKey);

    } catch (error) {
      console.error('Error in createIdentity:', error);
      Alert.alert('Error', `Failed to create identity: ${error.message || error.toString()}`);
    }
  };
  
  React.useEffect(() => {
    async function readStoredIdentity() {
      try {
        const storedKeypair = await RNSecureKeyStore.get('dilithiumKeypair');
        if (storedKeypair) {
          const keypair = JSON.parse(storedKeypair);
          const publicKey = keypair.publicKey;
          const hashedPublicKey = sha256(Buffer.from(publicKey, 'hex'));
          setIdentityHash(hashedPublicKey);
        }
      } catch (error) {
        console.error('Error reading secure key store:', error);
      }
    }
  
    readStoredIdentity();
  }, []);
  
  

  
  React.useEffect(() => {
    async function readStoredSettings() {
      let rememberedURL = null;

      try {
        rememberedURL = await AsyncStorage.getItem('dqxRegistryURL');
      } finally {
        if (!rememberedURL) {
          rememberedURL = 'https://beechat.buzz';
        }
      }

      let rememberedLogin = null;

      try {
        rememberedLogin = await AsyncStorage.getItem('dqxUserLogin');
      } finally {
        if (!rememberedLogin) {
          rememberedLogin = '';
        }
      }

      let rememberedPassword = null;

      try {
        rememberedPassword = await AsyncStorage.getItem('dqxUserPassword');
      } finally {
        if (!rememberedPassword) {
          rememberedPassword = '';
        }
      }

      setTagRegistryURL(rememberedURL);
      setUserLogin(rememberedLogin);
      setUserPassword(rememberedPassword);
    }

    readStoredSettings();
  }, []);

  React.useEffect(() => {
    async function storeSettings() {
      try {
        await AsyncStorage.setItem('dqxRegistryURL', tagRegistryURL);
        await AsyncStorage.setItem('dqxUserLogin', userLogin);
        await AsyncStorage.setItem('dqxUserPassword', userPassword);
      } catch (e) {
        // ignore
      }
    }

    if (viewMode !== 'settings') {
      storeSettings();
    }
  }, [tagRegistryURL, userLogin, userPassword, viewMode]);

  React.useEffect(() => {
    async function initNfc() {
      try {
        await NfcManager.start();
        const isSupported = await NfcManager.isSupported();
        const isEnabled = await NfcManager.isEnabled();
  
        setSupported(isSupported);
        setEnabled(isEnabled);
  
        if (!isSupported || !isEnabled) {
          Alert.alert(
            'NFC Unavailable',
            'NFC is not supported or enabled on this device. Some features may not be available.',
            [{ text: 'OK' }]
          );
        }
      } catch (ex) {
        console.error(ex);
        Alert.alert('ERROR', 'Failed to initialize NFC', [{ text: 'OK' }]);
      }
    }
  
    initNfc();
  }, []);
  

  async function generateChallenge() {
    let tmp = crypto.randomBytes(32);
    setChallenge(tmp);
  }

  React.useEffect(() => {
    generateChallenge();
  }, []);

  React.useEffect(() => {
    async function verifySignature() {
      if (nfcResult && nfcResult.signature) {
        setVerifyResult(
          await dilithiumVerifySig({
            publicKey: nfcResult.publicKey,
            challenge: nfcResult.challenge,
            signature: nfcResult.signature,
          }),
        );

        if (tagRegistryURL) {
          let lookupRes = await doLookupTag({
            serverAddr: tagRegistryURL,
            publicKeyHash: sha256(nfcResult.publicKey),
          });
          setLookupResult(lookupRes);
        }
      }
    }

    verifySignature();
  }, [nfcResult, tagRegistryURL]);

  async function cancelNfcOperation() {
    if (isWorking) {
      await NfcManager.cancelTechnologyRequest();
    }

    setNfcResult(null);
    setIsWorking(false);
  }

  async function btnPerformSigning() {
    let result = null;
    setCurrentAction('sign');
    setWorkStatusMessage('PLEASE TAP TAG');
    setIsWorking(true);
    setVerifyResult(false);
    setLookupResult(null);
    setNfcResult(null);

    try {
      result = await dqxPerformNFC(
        signChallenge,
        {setWorkStatusMessage},
        {challenge},
      );
      setNfcResult(result);
    } catch (e) {
      if (e.message) {
        Alert.alert('Error!', e.message);
      } else {
        Alert.alert('Communication error!');
      }
    }

    await generateChallenge();
    setIsWorking(false);
  }

  async function btnGenerateKeys() {
    setCurrentAction('generate');
    setViewMode('password');
  }

  async function btnEraseKeys() {
    setCurrentAction('erase');
    setViewMode('password');
  }

  async function btnChangePassword() {
    setCurrentAction('change_prev');
    setViewMode('password');
  }

  async function btnCancelPassword() {
    await cancelNfcOperation();
    setVerifyResult(false);
    setLookupResult(null);
    setNfcResult(null);
    setViewMode('create');
  }

  async function btnWriteURL() {
    setCurrentAction('write_url');
    setViewMode('password');
  }

  async function btnEditServerSettings() {
    setCurrentAction('server_settings');
    setViewMode('settings');
  }

  async function btnProceedAction() {
    if (erasePassword.length < 3) {
      Alert.alert('Erase password must have at least 3 characters!');
      return;
    }

    if (currentAction === 'change_prev') {
      setOldPassword(erasePassword);
      setErasePassword('');
      setCurrentAction('change_new');
    } else if (currentAction === 'change_new') {
      setWorkStatusMessage('PLEASE TAP TAG');
      setIsWorking(true);

      try {
        await dqxPerformNFC(
          changePassword,
          {setWorkStatusMessage},
          {oldPassword, erasePassword},
        );
        Alert.alert('Done, changed password.');
      } catch (e) {
        if (e.message) {
          Alert.alert('Error!', e.message);
        } else {
          Alert.alert('Communication error!');
        }
      }

      setOldPassword('');
      setErasePassword('');
      setNfcResult(null);
      setIsWorking(false);
      setViewMode('create');
    } else if (currentAction === 'generate') {
      let result = null;
      setCurrentAction('generate');
      setWorkStatusMessage('PLEASE TAP TAG');
      setIsWorking(true);

      try {
        result = await dqxPerformNFC(
          generateKeys,
          {setWorkStatusMessage},
          {erasePassword},
        );
        setNfcResult(result);

        if (tagRegistryURL && userLogin && userPassword) {
          let token = await doServerAuth({
            serverAddr: tagRegistryURL,
            email: userLogin,
            password: userPassword,
          });

          await doRegisterTag({
            serverAddr: tagRegistryURL,
            accessToken: token,
            tagData: {
              hash: sha256(result.publicKey),
              json: [
                {
                  name: 'DQX Tag Example',
                  public_key: Buffer.from(result.publicKey).toString('hex'),
                  hash: sha256(result.publicKey),
                },
              ],
            },
          });
          Alert.alert(
            'Done, generated a new key and registered with the server.',
          );
        } else {
          Alert.alert('Done, generated a new key.');
        }
      } catch (e) {
        if (e.message) {
          Alert.alert('Error!', e.message);
        } else {
          Alert.alert('Communication error!');
        }
      }

      setErasePassword('');
      setIsWorking(false);
      setViewMode('create');
    } else if (currentAction === 'erase') {
      setWorkStatusMessage('PLEASE TAP TAG');
      setIsWorking(true);

      try {
        await dqxPerformNFC(eraseKeys, {setWorkStatusMessage}, {erasePassword});
        Alert.alert('Done, erased keys.');
      } catch (e) {
        if (e.message) {
          Alert.alert('Error!', e.message);
        } else {
          Alert.alert('Communication error!');
        }
      }

      setErasePassword('');
      setNfcResult(null);
      setIsWorking(false);
      setViewMode('create');
    } else if (currentAction === 'write_url') {
      setWorkStatusMessage('PLEASE TAP TAG');
      setIsWorking(true);

      try {
        await dqxPerformNFC(
          writeURL,
          {setWorkStatusMessage},
          {erasePassword, newURL},
        );
        Alert.alert('Done, modified URL.');
      } catch (e) {
        if (e.message) {
          Alert.alert('Error!', e.message);
        } else {
          Alert.alert('Communication error!');
        }
      }

      setErasePassword('');
      setNfcResult(null);
      setIsWorking(false);
      setViewMode('create');
    }
  }

  function copyPublicKeyToClipboard() {
    if (nfcResult && nfcResult.publicKey) {
      Clipboard.setString(bytesToHex(nfcResult.publicKey));
      Alert.alert('Public key was copied to the clipboard!');
    }
  }
/*
  if (!supported || !enabled) {
    return (
      <SafeAreaView>
        <StatusBar barStyle={'light-content'} />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={{backgroundColor: 'white', padding: 30}}>
            <Text style={{color: 'black'}}>
              NFC is not supported or enabled.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  */

  const dimensions = Dimensions.get('window');
  const width = dimensions.width - 80;
  const imageHeight = Math.round((width * 439) / 1401);
  const imageWidth = width;
  let verifyButtonStyle = 'normal';
  let viewContent = <View />;
  let tagsPublicKey =
    nfcResult && nfcResult.publicKey ? sha256(nfcResult.publicKey) : '';
  let verifyTagLabel = 'VERIFY TAG';

  if (isWorking) {
    verifyButtonStyle = 'working';
  } else if (nfcResult && nfcResult.signature) {
    verifyButtonStyle = verifyResult ? 'success' : 'failure';
    verifyTagLabel = verifyResult ? 'TAG VERIFIED' : 'TAG NOT VERIFIED';
  }

  if (viewMode === 'main') {
    viewContent = (
      <View>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => btnPerformSigning()}
            title={!isWorking ? verifyTagLabel : workStatusMessage}
            disabled={isWorking}
            btnStyle={verifyButtonStyle}
          />
        </View>
        {tagsPublicKey && (
          <View style={{marginTop: 20}}>
            <Text style={{color: 'white', marginBottom: 20}}>
              Public key hash:
            </Text>
            <TouchableOpacity onPress={() => copyPublicKeyToClipboard()}>
              <View style={{backgroundColor: 'white'}}>
                <Text style={{color: 'black', padding: 15}}>
                  {tagsPublicKey}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {lookupResult && (
          <View style={{marginTop: 20}}>
            <Text style={{color: 'white', marginBottom: 20}}>
              Data on the server:
            </Text>
            <View style={{backgroundColor: 'white'}}>
              <Text
                style={{padding: 15, color: 'black', fontFamily: 'monospace'}}>
                {JSON.stringify(lookupResult, null, 4)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  } else if (viewMode === 'identity') {
    viewContent = (
      <View>
        {/* Back button and Identity Screen Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', padding: 20 }}>
          <TouchableOpacity onPress={() => setViewMode('main')}>
            <Image
              source={require('./assets/backIcon.png')}
              style={{ height: 60, width: 60 }}
            />
          </TouchableOpacity>
          <Text style={{
            fontSize: 25,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: 'white',
            paddingLeft: 10 // Add padding to separate the text from the icon
          }}>
            Identity
          </Text>
        </View>
        
        {/* Buttons for Identity actions */}
        <View style={{ paddingTop: 10, paddingBottom: 10 }}>
          <SButton
            title="Create New Identity"
            onPress={createIdentity} // Referencing the existing createIdentity function
            btnStyle={'normal'}
          />
        </View>

        {/* Placeholder for other buttons - you'll implement their onPress functions similarly */}
        <View style={{ paddingTop: 10, paddingBottom: 10 }}> 
          <SButton
            title="Sign Message"
            onPress={() => {/* Placeholder function */}}
            btnStyle={'normal'}
          />
        </View>
        <View style={{ paddingTop: 10, paddingBottom: 10 }}>
          <SButton
            title="Verify Message"
            onPress={() => {/* Placeholder function */}}
            btnStyle={'normal'}
          />
        </View>
        <View style={{ paddingTop: 10, paddingBottom: 10 }}>
          <SButton
            title="Export Keys"
            onPress={() => {/* Placeholder function */}}
            btnStyle={'normal'}
          />
        </View>
      </View>
    );
  } else if (viewMode === 'password') {
    let actionText = '';
    let proceedText = '';

    if (currentAction === 'generate') {
      actionText =
        'Please enter password to protect the tag. You will not be able to erase the key without knowing the password.';
      proceedText = 'GENERATE KEYS';
    } else if (currentAction === 'erase') {
      actionText =
        'Please enter erase password. This is the password that you have created upon key generation.';
      proceedText = 'ERASE KEYS';
    } else if (currentAction === 'change_prev') {
      actionText =
        'Please enter the current password. This is the password that you have created upon key generation.';
      proceedText = 'NEXT';
    } else if (currentAction === 'change_new') {
      actionText =
        'Please enter the new password. You will not be able to erase the key without knowing the password.';
      proceedText = 'CHANGE PASSWORD';
    } else if (currentAction === 'write_url') {
      actionText =
        'Please enter the current password and the new URL to be written to the tag.';
      proceedText = 'WRITE URL';
    }

    let passwordText = 'Current password:';

    if (currentAction === 'change_prev') {
      passwordText = 'Old password:';
    } else if (currentAction === 'change_new' || currentAction === 'generate') {
      passwordText = 'New password:';
    }

    viewContent = (
      <View>
        <View style={{paddingTop: 30}}>
          <Text style={{color: 'white'}}>{actionText}</Text>
          <View>
            <Text style={{paddingTop: 15, paddingBottom: 15, color: 'white'}}>
              {passwordText}
            </Text>
            <TextInput
              secureTextEntry={true}
              onChangeText={setErasePassword}
              value={erasePassword}
              style={{
                backgroundColor: 'white',
                color: 'black',
                borderRadius: 4,
                elevation: 3,
                borderColor: 'black',
                fontSize: 16,
                paddingHorizontal: 10,
              }}
              editable={!isWorking}
            />
          </View>
          {currentAction === 'write_url' && (
            <View>
              <Text style={{paddingTop: 15, paddingBottom: 15, color: 'white'}}>
                New URL to be written:
              </Text>
              <TextInput
                onChangeText={setNewURL}
                value={newURL}
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  borderRadius: 4,
                  elevation: 3,
                  borderColor: 'black',
                  fontSize: 16,
                  paddingHorizontal: 10,
                }}
                editable={!isWorking}
              />
            </View>
          )}
          <View style={{paddingTop: 15}}>
            <SButton
              onPress={() => btnProceedAction()}
              title={isWorking ? workStatusMessage : proceedText}
              disabled={isWorking}
              btnStyle={isWorking ? 'working' : 'normal'}
            />
          </View>
          <View style={{paddingTop: 15}}>
            <SButton
              onPress={() => btnCancelPassword()}
              title={'CANCEL'}
              btnStyle={'normal'}
            />
          </View>
        </View>
      </View>
    );
  } else if (viewMode === 'create') {
    viewContent = (
      <View>
        
        {identityHash && (
          <TouchableOpacity onPress={copyIdentityHashToClipboard}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                Identity Hash:
              </Text>
              <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                {identityHash}
              </Text>
            </View>
          </TouchableOpacity>

        )}
        <View style={{paddingTop: 30}}></View>
        <Text style={{fontSize: 24, color: 'white'}}>Tag management</Text>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => setViewMode('identity')}
            title={'Identity'}
            btnStyle={'normal'}
          />
        </View>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => btnGenerateKeys()}
            title={
              isWorking && currentAction === 'generate'
                ? workStatusMessage
                : 'Generate keys on tag'
            }
            disabled={isWorking}
            btnStyle={
              isWorking && currentAction === 'generate' ? 'working' : 'normal'
            }
          />
        </View>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => btnWriteURL()}
            title={'Write URL'}
            btnStyle={'normal'}
          />
        </View>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => btnChangePassword()}
            title={'Change password'}
            btnStyle={'normal'}
          />
        </View>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => btnEraseKeys()}
            title={
              isWorking && currentAction === 'erase'
                ? workStatusMessage
                : 'Erase keys on tag'
            }
            disabled={isWorking}
            btnStyle={
              isWorking && currentAction === 'erase' ? 'working' : 'normal'
            }
          />
        </View>
        <Text style={{fontSize: 24, color: 'white', marginTop: 30}}>
          Server verification
        </Text>
        <View style={{paddingTop: 30}}>
          <SButton
            onPress={() => btnEditServerSettings()}
            title={'Edit server settings'}
            btnStyle={'normal'}
          />
        </View>
      </View>
    );
  } else if (viewMode === 'settings') {
    viewContent = (
      <View>
        <View>
          <Text style={{fontSize: 24, color: 'white'}}>Server address</Text>
          <Text style={{paddingTop: 15, paddingBottom: 15, color: 'white'}}>
            Tag registry server address:
          </Text>
          <TextInput
            onChangeText={setTagRegistryURL}
            value={tagRegistryURL}
            style={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: 4,
              elevation: 3,
              borderColor: 'black',
              fontSize: 16,
              paddingHorizontal: 10,
              height: 50,
            }}
          />
        </View>

        <Text style={{fontSize: 24, color: 'white', marginTop: 30}}>
          Authentication
        </Text>
        <Text style={{paddingTop: 15, color: 'white'}}>
          Leave this section blank if you don't want to create new tags and
          register them with the tag registry server.
        </Text>
        <View>
          <Text style={{paddingTop: 15, paddingBottom: 15, color: 'white'}}>
            User login:
          </Text>
          <TextInput
            onChangeText={setUserLogin}
            value={userLogin}
            style={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: 4,
              elevation: 3,
              borderColor: 'black',
              fontSize: 16,
              paddingHorizontal: 10,
              height: 50,
            }}
          />
        </View>
        <View>
          <Text style={{paddingTop: 15, paddingBottom: 15, color: 'white'}}>
            User password:
          </Text>
          <TextInput
            onChangeText={setUserPassword}
            value={userPassword}
            secureTextEntry={true}
            style={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: 4,
              elevation: 3,
              borderColor: 'black',
              fontSize: 16,
              paddingHorizontal: 10,
              height: 50,
            }}
          />
        </View>

        <View style={{paddingTop: 15}}>
          <SButton
            onPress={() => btnCancelPassword()}
            title={'CANCEL'}
            btnStyle={'normal'}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{flex: 0.8, backgroundColor: '#010523'}}>
        {viewMode == 'main' ? (
          <View style={{backgroundColor: '#010523', padding: 40}}>
            <Image
              source={require('./assets/HorizontalLogoEleriumNew.png')}
              style={{
                height: imageHeight,
                width: imageWidth,
                resizeMode: 'contain',
              }}
            />
          </View>
        ) : viewMode == 'create' ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              style={{backgroundColor: '#010523', padding: 40}}
              onPress={async () => {
                await cancelNfcOperation();
                setVerifyResult(false);
                setLookupResult(null);
                setNfcResult(null);
                setViewMode('main');
              }}>
              <Image
                source={require('./assets/backIcon.png')}
                style={{height: 60, width: 60}}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 25,
                fontWeight: 'bold',
                // letterSpacing: 0.25,
                fontFamily: 'monospace',
                color: 'white',
              }}>
              Advanced
            </Text>
          </View>
        ) : (
          <View style={{height: 50}} />
        )}

        <View style={{padding: 30, paddingTop: 0}}>
          {viewContent}

          {/* <View>
            <Text
              style={{
                color: 'white',
                width: '100%',
                textAlign: 'center',
                marginTop: 30,
                fontSize: 16,
              }}>
              Copyright © Beechat Network Systems Ltd.
            </Text>
          </View> */}
        </View>
      </ScrollView>

      {viewMode !== 'password' && viewMode == 'main' ? (
        <View
          style={{
            flex: 0.2,
            flexDirection: 'row',
            backgroundColor: '#010523',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingHorizontal: 30,
          }}>
          <TouchableOpacity
            onPress={async () => {
              await cancelNfcOperation();
              setVerifyResult(false);
              setNfcResult(null);
              setViewMode('create');
            }}>
            <Image
              source={require('./assets/settingIcon.png')}
              style={{height: 80, width: 80}}
            />
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={async () => {
              await cancelNfcOperation();
              setVerifyResult(false);
              setLookupResult(null);
              setNfcResult(null);
              setViewMode('main');
            }}>
            <View
              style={{
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'white',
                width: dimensions.width * 0.5,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1E1E1F',
              }}>
              <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white'}}>
                VERIFY TAG
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await cancelNfcOperation();
              setVerifyResult(false);
              setNfcResult(null);
              setViewMode('create');
            }}>
            <View
              style={{
                borderWidth: 2,
                borderStyle: 'solid',
                borderLeftWidth: 0,
                borderColor: 'white',
                width: dimensions.width * 0.5,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1E1E1F',
              }}>
              <Text style={{fontSize: 24, fontWeight: 'bold', color: 'white'}}>
                ADVANCED
              </Text>
            </View>
          </TouchableOpacity> */}
        </View>
      ) : (
        <View />
      )}
    </SafeAreaView>
  );
};

export default App;

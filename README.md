# Elerium App

## Introduction
Elerium App is a sophisticated tool for managing Elerium NFC tags and utilizing Dilithium signatures, focused on secure identity management and data verification via NFC.

## Architecture and Code Snippets
### Components
- **SButton**: 
  ```jsx
  <SButton onPress={handlePress} title="Submit" btnStyle="success" disabled={false} />
  ```
- **CustomTextInput**: 
  ```jsx
  <CustomTextInput onChangeText={handleTextChange} value={inputValue} placeholder="Enter text here" />
  ```

### Screens
- **Main**: Core functionality for NFC.
- **Settings**: For advanced configurations.
- **Identity**: Manages cryptographic identities.

### Services and Utilities
- **Helpers**: 
  ```javascript
  hexToBytes(hexString);
  bytesToHex(byteArray);
  ```
- **HttpUtils**: 
  ```javascript
  doServerAuth(params);
  doRegisterTag(params);
  ```

### Navigator
- **RootStack Navigator**: Uses `@react-navigation/native`.

## Key Features
- Cryptographic operations with Dilithium signatures.
- NFC tag management.
- Modular architecture for scalability.

The Elerium App integrates cryptographic functionality with NFC technology, offering a secure and user-friendly interface for data management and identity verification.
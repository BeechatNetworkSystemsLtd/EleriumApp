function hexToBytes(hex) {
  let bytes, c;
  for (bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function hexToBytesIOS(hex) {
  // Remove hyphens
  hex = hex.replace(/-/g, "");

  let bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  // Adjust the byte array to be exactly 32 bytes long
  if (bytes.length > 32) {
    bytes = bytes.slice(-32); // Truncate to last 32 bytes if too long
  } else {
    while (bytes.length < 32) {
      bytes.unshift(0); // Pad with leading zeros if too short
    }
  }

  return bytes;
}

function bytesToHex(bytes) {
  let hex, i;
  for (hex = [], i = 0; i < bytes.length; i++) {
    let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    // eslint-disable-next-line no-bitwise
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join("");
}

export { hexToBytes, bytesToHex, hexToBytesIOS };

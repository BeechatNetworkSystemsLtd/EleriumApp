import axios from "axios";

import { Connection, PublicKey } from "@solana/web3.js";
import { programs } from "@metaplex/js";

const {
  metadata: { Metadata },
} = programs;

export async function doServerAuth({ serverAddr, email, password }) {
  let res = await axios.post(serverAddr + "/api/login", {
    email,
    password,
  });

  return res.data.access_token;
}

export async function doRegisterTag({ serverAddr, accessToken, tagData }) {
  let res = await axios.post(serverAddr + "/api/pushdata", tagData, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  return res.data;
}

// export async function doLookupTag({ serverAddr, publicKeyHash }) {
//   let res = await axios.get(serverAddr + "/api/data", {
//     params: {
//       search_query: publicKeyHash,
//     },
//   });

//   if (res.data.data && res.data.data.length > 0) {
//     return res.data.data[res.data.data.length - 1];
//   }

//   return null;
// }

export async function doLookupTag({ serverAddr, publicKeyHash }) {
  try {
    let res = await axios.get(
      serverAddr + "/api/nft/phygital/" + publicKeyHash
    );

    if (res.data !== null) {
      return res.data;
    }

    return "No server response";
  } catch (error) {
    console.error("API Error:", error.message);
    // Potentially log the error to an error reporting service here
    return "API Error: " + error.message;
  }
}

export async function addingMetadata(baseUrl, data, headers) {
  let config = {
    method: "POST",
    url: baseUrl + "v1/data",
    headers,
    data: data,
    maxBodyLength: Infinity,
  };

  try {
    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
export async function retrievingMetadata(baseUrl, headers, hashedPublicKey) {
  let config = {
    method: "GET",
    url: baseUrl + "v1/data/getByHashedkey/" + hashedPublicKey,
  };
  try {
    try {
      const response = await axios.request(config);
      return response;
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}
export async function updatingMetadata(
  baseUrl,
  headers,
  data,
  hashedPublicKey
) {
  let config = {
    method: "PUT",
    url: baseUrl + "v1/data/" + hashedPublicKey,
    headers,
    data,
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

export async function removingMetadata(baseUrl, headers, hashedPublicKey) {
  let config = {
    method: "DELETE",
    url: baseUrl + "v1/data/" + hashedPublicKey,
    headers,
  };
  try {
    await axios.request(config);

    return "Data deleted successfully";
  } catch (error) {
    // Handle validation errors or any other errors
    console.error("Error:", error.message);
    throw error;
  }
}

export async function getMyAssets(baseUrl, headers, hashedPublicKey) {
  let config = {
    method: "GET",
    url: baseUrl + "v1/data/getHashListByPublicKey/" + hashedPublicKey,
  };
  try {
    try {
      const response = await axios.request(config);
      return response;
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

export async function uploadWallet(data) {
  let config = {
    method: "POST",
    url: "http://138.68.142.59:5000/wallet",
    data: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    try {
      const response = await axios.request(config);

      return response;
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

export const getNFTs = async (publicKey) => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const pubKey = new PublicKey(publicKey);
  const nfts = await Metadata.findDataByOwner(connection, pubKey);

  return nfts.map((nft) => ({
    mint: nft.mint,
    name: nft.data.name,
    uri: nft.data.uri,
  }));
};
export const getNFTLink = async (link) => {
  let config = {
    method: "GET",
    maxBodyLength: Infinity,
    url: link,
    headers: {},
  };

  try {
    try {
      const response = await axios.request(config);

      return response;
    } catch (error) {
      console.error("Fetch Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

export const getAllNFTs = async (publicKey) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.simplehash.com/api/v0/nfts/owners?chains=solana,ethereum&wallet_addresses=${publicKey}&order_by=transfer_time__asc&limit=50`,
    headers: {
      "X-API-KEY": "beechat_sk_oo0tgrh6e20rqdp7c2pkhoq745pwn8bs",
      Accept: "application/json",
    },
  };

  try {
    const response = await axios.request(config);

    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

export const getNFTDetails = async (NFTId) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://www.crossmint.com/api/2022-06-09/collections/598a7a02-6787-459b-a5b3-d5f0ee252fdc/nfts/${NFTId}`,
    headers: {
      "X-API-KEY":
        "sk_production_6BKBM7ABJ9ZpCCCeTJWuMieBbNg2xLWqY4dxG8ivK5K7HhU3YwsgJ5jS9bBsnt3H3S19cVLDmYvbjQixp57r9jowtGZQypN5X5RY2eiU6nHuFksJdn8GhZcJxAZ9BMfQ4mwR2CqTvTmgamzQqmMMoeRrEDcypADPFgD1M8xK3MukP3uLeHDDBwmUBvsbG4M4SM9cH6U24fGXYW7EoZceG619",
    },
  };

  try {
    const response = await axios.request(config);

    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

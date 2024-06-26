import axios from "axios";

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

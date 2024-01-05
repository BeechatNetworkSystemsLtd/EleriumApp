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

export async function doLookupTag({ serverAddr, publicKeyHash }) {
  let res = await axios.get(serverAddr + "/api/data", {
    params: {
      search_query: publicKeyHash,
    },
  });

  if (res.data.data && res.data.data.length > 0) {
    return res.data.data[res.data.data.length - 1];
  }

  return null;
}

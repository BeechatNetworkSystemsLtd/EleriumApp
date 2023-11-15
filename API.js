import axios from 'axios';

export async function doServerAuth({serverAddr, email, password}) {
  let res = await axios.post(serverAddr + '/api/login', {
    email,
    password,
  });

  return res.data.access_token;
}

export async function doRegisterTag({serverAddr, accessToken, tagData}) {
  let res = await axios.post(serverAddr + '/api/pushdata', tagData, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  });

  return res.data;
}

export async function doLookupTag({serverAddr, publicKeyHash}) {
  let res = await axios.get(serverAddr + '/api/data', {
    params: {
      search_query: publicKeyHash,
    },
  });

  if (res.data.data && res.data.data.length > 0) {
    return res.data.data[res.data.data.length - 1];
  }

  return null;
}

/*


let accessToken = await doServerAuth({serverAddr: "https://beechat.buzz", "email": "guest@example.com", "password": "guestpassword"});

let res = await doRegisterTag({serverAddr: "https://beechat.buzz", accessToken, tagData: {
        "hash": "eedd17aa4c55b89b95986b5b266817fefc81e134c90a7ff355b789c1a55efdc4",
        "json": [
            {
                "name": "DQX Card",
                "price": "£1099.95",
                "image": "https://pin.ski/3OatSrz",
                "warranty": false,
                "agent": "guest@example.com",
                "timestamp": "24.07.2023",
                "description": "Ownership represents civilisation itself",
                "colour": "MJF Black2",
                "style": "SLS, B7000 glue, Polyimide  , ",
                "public_key": "Full public key goes here",
                "hash": "eedd17aa4c55b89b95986b5b266817fefc81e134c90a7ff355b789c1a55efdc4"
            }
        ]
    }
});

console.log(res);

let res2 = await doLookupTag({serverAddr: 'https://beechat.buzz', publicKeyHash: 'eedd17aa4c55b89b95986b5b266817fefc81e134c90a7ff355b789c1a55efdc4'});

console.log(res2);


 */

import AsyncStorage from "@react-native-async-storage/async-storage";
export const storeJson = async (key, data) => {
  const strigified = JSON.stringify(data);
  await AsyncStorage.setItem(key, strigified);
};

export const getJson = async (key) => {
  const data = await AsyncStorage.getItem(key);
  if (data) {
    const parsed = await JSON.parse(data);
    return parsed;
  }
  return null;
};

export const storeString = async (key, data) => {
  await AsyncStorage.setItem(key, data);
};

export const getString = async (key) => {
  return await AsyncStorage.getItem(key);
};

export const removeItem = async (key) => {
  await AsyncStorage.removeItem(key);
  return null;
};

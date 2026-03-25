import AsyncStorage from '@react-native-async-storage/async-storage';

export const setToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('@auth_token', token);
  } catch (e) {
    console.error('Error saving token', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@auth_token');
  } catch (e) {
    console.error('Error getting token', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@auth_token');
  } catch (e) {
    console.error('Error removing token', e);
  }
};

export const validateEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

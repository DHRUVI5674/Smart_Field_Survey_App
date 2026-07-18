import AsyncStorage from '@react-native-async-storage/async-storage';

export const SURVEYS_KEY = 'surveys';

export const saveData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving data', e);
  }
};

export const loadData = async (key) => {
  try {
    const json = await AsyncStorage.getItem(key);
    return json != null ? JSON.parse(json) : null;
  } catch (e) {
    console.error('Error loading data', e);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing data', e);
  }
};

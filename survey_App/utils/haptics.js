// utils/haptics.js
// Centralized haptic feedback wrappers using expo-haptics
import * as Haptics from 'expo-haptics';

export const hapticImpactLight = async () => {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
};

export const hapticImpactMedium = async () => {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
};

export const hapticImpactHeavy = async () => {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
};

export const hapticSelection = async () => {
  try { await Haptics.selectionAsync(); } catch (e) {}
};

export const hapticNotificationSuccess = async () => {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
};

export const hapticNotificationError = async () => {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) {}
};

// Convenience aliases used throughout the app
export const hapticButtonPress = async () => {
  await hapticImpactLight();
};

export const hapticSubmit = async () => {
  await hapticImpactMedium();
  await hapticNotificationSuccess();
};

export const hapticDelete = async () => {
  await hapticImpactHeavy();
  await hapticNotificationError();
};

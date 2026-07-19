/**
 * utils/notifications.js
 *
 * Centralised helper module for all expo-notifications logic.
 * All functions gracefully handle permission-denied and other
 * errors — the app will never crash if notifications fail.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// ─── Notification handler (foreground behaviour) ───────────────────────────
// Show banner + play sound even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Delay constant ────────────────────────────────────────────────────────
// 10 seconds for dev/testing.  Change to 86400 (24 h) for production.
const REMINDER_DELAY_SECONDS = 10;

/**
 * Requests notification permission on the device.
 * Shows a native prompt on first call; subsequent calls return the cached status.
 *
 * @returns {Promise<boolean>} true if permission is granted, false otherwise.
 */
export async function requestNotificationPermission() {
  try {
    // Notifications only work on physical / emulated devices, not simulators.
    if (!Device.isDevice) {
      console.log('[Notifications] Skipping permission request — not a physical device.');
      return false;
    }

    // Android 13+ requires explicit permission; earlier versions auto-grant.
    if (Platform.OS === 'android' && Platform.Version < 33) {
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (e) {
    console.warn('[Notifications] Permission request failed:', e);
    return false;
  }
}

/**
 * Schedules a local reminder notification for a draft survey.
 *
 * @param {string} surveyId  - The survey's unique ID (e.g. "SUR-1234567890").
 * @param {string} siteName  - Human-readable site name for the notification body.
 * @returns {Promise<string|null>} The notification identifier, or null on failure.
 */
export async function scheduleReminderNotification(surveyId, siteName) {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Survey Reminder',
        body: `Your draft survey "${siteName}" is still pending. Tap to review and submit.`,
        data: { surveyId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: REMINDER_DELAY_SECONDS,
        repeats: false,
      },
    });

    console.log(`[Notifications] Scheduled reminder for survey ${surveyId} — notificationId: ${notificationId}`);
    return notificationId;
  } catch (e) {
    console.warn('[Notifications] Failed to schedule reminder:', e);
    return null;
  }
}

/**
 * Cancels a previously scheduled reminder notification.
 *
 * @param {string|null|undefined} notificationId - The ID returned by scheduleReminderNotification().
 */
export async function cancelReminderNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notifications] Cancelled notification: ${notificationId}`);
  } catch (e) {
    console.warn('[Notifications] Failed to cancel notification:', e);
  }
}

/**
 * Registers a listener that fires when the user taps a notification.
 * Navigates to the survey-details screen using the surveyId from the payload.
 *
 * @param {object} router - The expo-router router instance.
 * @returns {Notifications.Subscription} The subscription — call .remove() to clean up.
 */
export function setupNotificationResponseHandler(router) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    try {
      const surveyId = response?.notification?.request?.content?.data?.surveyId;
      if (surveyId) {
        console.log(`[Notifications] Notification tapped — navigating to survey ${surveyId}`);
        router.push(`/survey-details?surveyId=${surveyId}`);
      }
    } catch (e) {
      console.warn('[Notifications] Navigation from notification failed:', e);
    }
  });
  return subscription;
}

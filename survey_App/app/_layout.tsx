import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SurveyProvider } from '../context/surveyContext';
import { ThemeProvider as AppThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import {
  requestNotificationPermission,
  setupNotificationResponseHandler,
} from '../utils/notifications';
import Toast from '../components/ui/Toast';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NotificationBootstrap() {
  const router = useRouter();
  const listenerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Request permission; alert if denied
      const granted = await requestNotificationPermission();
      if (!granted && mounted) {
        Alert.alert(
          'Notifications Disabled',
          'Survey reminders will not be sent. You can enable notifications in your device Settings.',
          [{ text: 'OK' }]
        );
      }
    })();

    // Register tap-to-navigate listener (only once)
    if (!listenerRef.current) {
      listenerRef.current = setupNotificationResponseHandler(router);
    }

    return () => {
      mounted = false;
      // Clean up listener on unmount
      if (listenerRef.current) {
        listenerRef.current.remove();
        listenerRef.current = null;
      }
    };
  }, []);

  return null;
}

// ─── Shake Detector ────────────────────────────────────────────────────────
function ShakeDetector() {
  const router = useRouter();
  const lastShake = useRef(0);

  useEffect(() => {
    let sub = null;
    let active = true;

    (async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (isAvailable && active) {
          Accelerometer.setUpdateInterval(150);
          sub = Accelerometer.addListener(({ x, y, z }) => {
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            const now = Date.now();
            if (magnitude > 2.4 && now - lastShake.current > 3000) {
              lastShake.current = now;
              router.push('/(drawer)/shake-report');
            }
          });
        }
      } catch (e) {
        console.warn("Accelerometer is not available in this environment", e);
      }
    })();

    return () => {
      active = false;
      if (sub) {
        sub.remove();
      }
    };
  }, []);

  return null;
}


// ─── Onboarding Redirect ───────────────────────────────────────────────────
function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem('@onboarding_done');
      if (!done) {
        router.replace('/onboarding');
      }
    })();
  }, []);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <ToastProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SurveyProvider>
              <NotificationBootstrap />
              <ShakeDetector />
              <OnboardingRedirect />
              <Stack>
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="survey-details" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <Toast />
              <StatusBar style="auto" />
            </SurveyProvider>
          </ThemeProvider>
        </ToastProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}


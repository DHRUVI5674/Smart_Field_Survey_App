import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '../../context/ThemeContext';
import { useSurveys } from '../../context/surveyContext';

export default function LocationScreen() {
  const navigation = useNavigation();
  const { theme, spacing, mode, toggleTheme } = useAppTheme();
  const { setActiveLocation } = useSurveys();
  
  const [permissionResponse, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Auto-dismiss the custom toast alert after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      // Use high accuracy settings
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLoc);
      setActiveLocation(currentLoc);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Location Error',
        'Could not fetch your location. Please ensure location services (GPS) are enabled and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch location once permission is granted
  useEffect(() => {
    if (permissionResponse?.granted) {
      fetchLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionResponse]);

  const handleRequestPermission = async () => {
    try {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert(
          'Permission Required',
          'Location access is needed to capture coordinates for field surveys.'
        );
      }
    } catch (_error) {
      Alert.alert('Error', 'An error occurred while requesting permission.');
    }
  };

  const copyToClipboard = async () => {
    if (!location) {
      Alert.alert('No Location', 'Please fetch your current location details first.');
      return;
    }
    const lat = location.coords.latitude.toFixed(6);
    const lng = location.coords.longitude.toFixed(6);
    const accuracy = location.coords.accuracy ? location.coords.accuracy.toFixed(2) : 'N/A';
    const textToCopy = `Latitude: ${lat}, Longitude: ${lng} (Accuracy: ±${accuracy}m)`;
    
    await Clipboard.setStringAsync(textToCopy);
    setToastMessage(`Latitude: ${lat}, Longitude: ${lng}`);
    setShowToast(true);
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    header: {
      height: 75,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: theme.surface,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    menuIcon: {
      fontSize: 26,
      color: theme.accentDark,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 11,
      color: theme.muted,
      textAlign: 'center',
      marginTop: 2,
    },
    themeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: theme.surface,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
    themeIcon: {
      fontSize: 20,
      color: theme.accentDark,
    },
    scrollContent: {
      padding: spacing.md,
      alignItems: 'center',
      paddingBottom: 40,
    },
    visualSection: {
      width: '100%',
      alignItems: 'center',
      marginVertical: spacing.md,
    },
    mapPinContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(6, 74, 120, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    mapPinPulse: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(6, 74, 120, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mapPinIcon: {
      fontSize: 32,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: permissionResponse?.granted ? '#DEF7EC' : '#FDE8E8',
      marginTop: spacing.xs,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: permissionResponse?.granted ? '#03543F' : '#9B1C1C',
    },
    cardsContainer: {
      width: '100%',
      marginVertical: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: spacing.md,
    },
    coordCard: {
      width: '48%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: spacing.md,
      elevation: 4,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    fullWidthCard: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: spacing.md,
      elevation: 4,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    cardLabel: {
      fontSize: 12,
      color: theme.muted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.xs,
    },
    cardValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    cardUnit: {
      fontSize: 12,
      color: theme.muted,
      marginTop: 4,
    },
    buttonContainer: {
      width: '100%',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    primaryBtn: {
      backgroundColor: theme.accent,
      paddingVertical: 14,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: theme.accent,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
    },
    primaryBtnText: {
      color: theme.surface,
      fontWeight: '700',
      fontSize: 16,
    },
    secondaryBtn: {
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.accent,
      paddingVertical: 14,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: theme.accent,
      fontWeight: '700',
      fontSize: 16,
    },
    loaderContainer: {
      paddingVertical: spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loaderText: {
      marginTop: spacing.sm,
      color: theme.muted,
      fontSize: 14,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    permissionIcon: {
      marginBottom: spacing.md,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    permissionText: {
      fontSize: 14,
      color: theme.muted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.lg,
    },
    toastContainer: {
      position: 'absolute',
      top: 50,
      left: 20,
      right: 20,
      zIndex: 999,
      alignItems: 'center',
    },
    toastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderLeftWidth: 5,
      borderLeftColor: '#10B981', // Premium Emerald Green
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      width: '100%',
      elevation: 6,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    toastIcon: {
      marginRight: 12,
    },
    toastTextContent: {
      flex: 1,
    },
    toastTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    toastMessage: {
      fontSize: 12,
      color: theme.muted,
      marginTop: 2,
    },
    toastCloseBtn: {
      padding: 6,
    },
    toastCloseText: {
      fontSize: 14,
      color: theme.muted,
      fontWeight: '600',
    },
  });

  // Render loading state for checking permissions
  if (permissionResponse === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loaderText, { marginTop: spacing.md }]}>Checking location permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render permissions request screen if not granted
  if (!permissionResponse.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color={theme.accentDark} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Location Screen</Text>
            <Text style={styles.headerSubtitle}>Smart Field Survey</Text>
          </View>
          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <MaterialIcons
              name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
              size={20}
              color={theme.accentDark}
            />
          </Pressable>
        </View>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="location-off" size={64} color={theme.muted} style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionText}>
            We need your location permission to fetch latitude, longitude, and accuracy coordinates. This information is key for documenting survey site locations.
          </Text>
          <Pressable style={[styles.primaryBtn, { width: '80%' }]} onPress={handleRequestPermission}>
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Toast Alert */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <MaterialIcons name="check-circle" size={22} color="#10B981" style={styles.toastIcon} />
            <View style={styles.toastTextContent}>
              <Text style={styles.toastTitle}>Coordinates Copied!</Text>
              <Text style={styles.toastMessage}>{toastMessage}</Text>
            </View>
            <Pressable onPress={() => setShowToast(false)} style={styles.toastCloseBtn}>
              <MaterialIcons name="close" size={18} color={theme.muted} />
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.container}>
        
        {/* Custom Header */}
        <View style={styles.header}>
          <Pressable onPress={openDrawer} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color={theme.accentDark} />
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>Location Screen</Text>
            <Text style={styles.headerSubtitle}>Smart Field Survey</Text>
          </View>

          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            <MaterialIcons
              name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
              size={20}
              color={theme.accentDark}
            />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Visual Map Pin Header */}
          <View style={styles.visualSection}>
            <View style={styles.mapPinContainer}>
              <View style={styles.mapPinPulse}>
                <MaterialIcons name="place" size={36} color={theme.accent} />
              </View>
            </View>
            <View style={styles.statusBadge}>
              <MaterialIcons name="my-location" size={14} color="#03543F" style={{ marginRight: 6 }} />
              <Text style={styles.statusBadgeText}>GPS Tracking Enabled</Text>
            </View>
          </View>

          {/* Coordinate Display Cards */}
          <View style={styles.cardsContainer}>
            <View style={styles.row}>
              {/* Latitude Card */}
              <View style={styles.coordCard}>
                <Text style={styles.cardLabel}>Latitude</Text>
                <Text style={styles.cardValue}>
                  {location ? location.coords.latitude.toFixed(6) : '---.------'}
                </Text>
                <Text style={styles.cardUnit}>Decimal Degrees</Text>
              </View>

              {/* Longitude Card */}
              <View style={styles.coordCard}>
                <Text style={styles.cardLabel}>Longitude</Text>
                <Text style={styles.cardValue}>
                  {location ? location.coords.longitude.toFixed(6) : '---.------'}
                </Text>
                <Text style={styles.cardUnit}>Decimal Degrees</Text>
              </View>
            </View>

            {/* Accuracy Card */}
            <View style={styles.fullWidthCard}>
              <Text style={styles.cardLabel}>GPS Accuracy</Text>
              <Text style={styles.cardValue}>
                {location ? `± ${location.coords.accuracy ? location.coords.accuracy.toFixed(1) : '0.0'}` : '---.-'}
              </Text>
              <Text style={styles.cardUnit}>Meters (Lower is more accurate)</Text>
            </View>
          </View>

          {/* Loading indicator during fetch */}
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <Text style={styles.loaderText}>Fetching fresh coordinates...</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]} 
              onPress={fetchLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.surface} style={{ marginRight: 8 }} />
              ) : (
                <MaterialIcons name="refresh" size={20} color={theme.surface} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.primaryBtnText}>
                {loading ? 'Refreshing...' : 'Refresh Location'}
              </Text>
            </Pressable>

            <Pressable 
              style={[styles.secondaryBtn, !location && { opacity: 0.5 }]} 
              onPress={copyToClipboard}
              disabled={!location}
            >
              <MaterialIcons name="content-copy" size={18} color={theme.accent} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>Copy Coordinates</Text>
            </Pressable>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '../../context/ThemeContext';
import { useSurveys } from '../../context/surveyContext';

export default function ClipboardScreen() {
  const navigation = useNavigation();
  const { surveys, setActiveContact, setActiveLocation } = useSurveys();
  const { theme, spacing, mode, toggleTheme } = useAppTheme();

  const [notes, setNotes] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Determine latest Survey ID from context or generate template ID
  const latestSurveyId = surveys.length > 0 ? surveys[0].id : 'SUR-20260718-001';
  const clientContactName = 'John Doe';
  const clientContactNumber = '+1 (555) 019-2834';

  const handleCopySurveyId = async () => {
    await Clipboard.setStringAsync(latestSurveyId);
    setToastMessage(`Copied Survey ID: ${latestSurveyId}`);
    setShowToast(true);
  };

  const handleCopyContact = async () => {
    await Clipboard.setStringAsync(clientContactNumber);
    setToastMessage(`Copied Contact Number: ${clientContactNumber}`);
    setShowToast(true);
    setActiveContact({ name: clientContactName, phone: clientContactNumber });
  };

  const handleCopyLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== 'granted') {
          Alert.alert(
            'Location Access Denied',
            'Permission is required to query device location.'
          );
          setLocLoading(false);
          return;
        }
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const lat = loc.coords.latitude.toFixed(6);
      const lng = loc.coords.longitude.toFixed(6);
      const textToCopy = `Lat: ${lat}, Lng: ${lng}`;
      
      await Clipboard.setStringAsync(textToCopy);
      setToastMessage(`Copied Coordinates: ${textToCopy}`);
      setShowToast(true);
      setActiveLocation(loc);
    } catch (error) {
      console.error(error);
      Alert.alert('Location Error', 'Unable to fetch current coordinates.');
    } finally {
      setLocLoading(false);
    }
  };

  const handlePasteNotes = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text) {
        setToastMessage('Clipboard is empty');
        setShowToast(true);
        return;
      }
      // Append text if already exists, or set
      setNotes((prev) => (prev ? `${prev}\n${text}` : text));
      setToastMessage('Pasted from clipboard!');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Paste Error', 'Failed to paste notes from clipboard.');
    }
  };

  const handleClearAll = async () => {
    try {
      // Clear clipboard data
      await Clipboard.setStringAsync('');
      // Clear local state
      setNotes('');
      setToastMessage('Clipboard & workspace cleared!');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      Alert.alert('Clear Error', 'Failed to reset workspace contents.');
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.lg * 2,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.md,
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.04)',
    },
    tileLast: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    tileContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    tileLabel: {
      fontSize: 13,
      color: theme.muted,
      fontWeight: '600',
    },
    tileValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      marginTop: 4,
    },
    copyBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: 'rgba(6, 74, 120, 0.06)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    workspaceCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: spacing.md,
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      marginBottom: spacing.md,
    },
    notesInput: {
      minHeight: 120,
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderRadius: 10,
      padding: spacing.sm,
      color: theme.text,
      fontSize: 15,
      textAlignVertical: 'top',
      marginBottom: spacing.md,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    primaryBtn: {
      flex: 1,
      backgroundColor: theme.accent,
      paddingVertical: 12,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: theme.accent,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    dangerBtn: {
      flex: 1,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: '#EF4444',
      paddingVertical: 12,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dangerBtnText: {
      color: '#EF4444',
      fontWeight: '700',
      fontSize: 14,
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
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Copy Success Toast */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <MaterialIcons name="check-circle" size={22} color="#10B981" style={styles.toastIcon} />
            <View style={styles.toastTextContent}>
              <Text style={styles.toastTitle}>Success</Text>
              <Text style={styles.toastMessage} numberOfLines={1}>{toastMessage}</Text>
            </View>
            <Pressable onPress={() => setShowToast(false)} style={{ padding: 6 }}>
              <MaterialIcons name="close" size={18} color={theme.muted} />
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          
          {/* Custom Header */}
          <View style={styles.header}>
            <Pressable onPress={openDrawer} style={styles.menuButton}>
              <MaterialIcons name="menu" size={24} color={theme.accentDark} />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>Clipboard Hub</Text>
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
            
            {/* Quick Copy Section */}
            <Text style={styles.sectionTitle}>Quick Copy Fields</Text>
            <View style={styles.card}>
              
              {/* Survey ID Tile */}
              <View style={styles.tile}>
                <View style={styles.tileContent}>
                  <Text style={styles.tileLabel}>Active Survey ID</Text>
                  <Text style={styles.tileValue}>{latestSurveyId}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.copyBtn,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={handleCopySurveyId}
                >
                  <MaterialIcons name="content-copy" size={16} color={theme.accent} />
                </Pressable>
              </View>

              {/* Contact Number Tile */}
              <View style={styles.tile}>
                <View style={styles.tileContent}>
                  <Text style={styles.tileLabel}>Client Contact</Text>
                  <Text style={styles.tileValue}>
                    {clientContactName} ({clientContactNumber})
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.copyBtn,
                    pressed && { opacity: 0.7 }
                  ]}
                  onPress={handleCopyContact}
                >
                  <MaterialIcons name="content-copy" size={16} color={theme.accent} />
                </Pressable>
              </View>

              {/* GPS Coordinates Tile */}
              <View style={styles.tileLast}>
                <View style={styles.tileContent}>
                  <Text style={styles.tileLabel}>Current GPS Coordinates</Text>
                  <Text style={styles.tileValue}>
                    {locLoading ? 'Fetching Location...' : 'Get Live Coordinates'}
                  </Text>
                </View>
                {locLoading ? (
                  <View style={[styles.copyBtn, { backgroundColor: 'transparent' }]}>
                    <ActivityIndicator size="small" color={theme.accent} />
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [
                      styles.copyBtn,
                      pressed && { opacity: 0.7 }
                    ]}
                    onPress={handleCopyLocation}
                  >
                    <MaterialIcons name="my-location" size={18} color={theme.accent} />
                  </Pressable>
                )}
              </View>

            </View>

            {/* Notes Paste Workspace Section */}
            <Text style={styles.sectionTitle}>Notes Workspace</Text>
            <View style={styles.workspaceCard}>
              <TextInput
                style={styles.notesInput}
                placeholder="Paste survey text here, or write field notes..."
                placeholderTextColor={theme.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={6}
              />
              
              <View style={styles.buttonRow}>
                {/* Paste Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { opacity: 0.85 }
                  ]}
                  onPress={handlePasteNotes}
                >
                  <MaterialIcons name="content-paste" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Paste Notes</Text>
                </Pressable>

                {/* Clear Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.dangerBtn,
                    pressed && { opacity: 0.75 }
                  ]}
                  onPress={handleClearAll}
                >
                  <MaterialIcons name="delete-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text style={styles.dangerBtnText}>Clear All</Text>
                </Pressable>
              </View>

            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '../../context/ThemeContext';

// AsyncStorage key for the survey reminders toggle
const REMINDERS_KEY = '@survey_reminders_enabled';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, mode, toggleTheme } = useAppTheme();

  // ── Notification toggle state ──────────────────────────────────────
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Load persisted toggle value on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDERS_KEY);
        // null = never set → default to true (enabled)
        setRemindersEnabled(stored === null || stored === 'true');
      } catch (e) {
        console.warn('[Settings] Failed to load reminders preference:', e);
      }
    })();
  }, []);

  const handleRemindersToggle = async (value) => {
    setRemindersEnabled(value);
    try {
      await AsyncStorage.setItem(REMINDERS_KEY, value ? 'true' : 'false');
    } catch (e) {
      console.warn('[Settings] Failed to save reminders preference:', e);
    }
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    header: {
      height: 64,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: theme.text },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 20,
      marginTop: 24,
      marginBottom: 12,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginHorizontal: 20,
      paddingVertical: 4,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.text },
    rowSub: { fontSize: 12, color: theme.muted, marginTop: 2 },
    divider: { height: 1, backgroundColor: `${theme.muted}15`, marginHorizontal: 16 },
    version: {
      textAlign: 'center',
      color: theme.muted,
      fontSize: 12,
      marginTop: 40,
      marginBottom: 20,
    },
  });

  const staticGeneralItems = [
    { icon: 'language', label: 'Language', sub: 'English', color: '#3B82F6' },
    { icon: 'cloud-upload', label: 'Auto-Sync', sub: 'Off', color: '#8B5CF6' },
    { icon: 'storage', label: 'Storage', sub: '12.4 MB used', color: '#10B981' },
  ];

  const aboutItems = [
    { icon: 'info', label: 'App Version', sub: '1.0.0', color: '#6366F1' },
    { icon: 'security', label: 'Privacy Policy', color: '#EF4444' },
    { icon: 'help-outline', label: 'Help & Support', color: '#0EA5E9' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={openDrawer}>
          <MaterialIcons name="menu" size={26} color={theme.accentDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <Pressable onPress={toggleTheme}>
          <MaterialIcons
            name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
            size={24}
            color={theme.accentDark}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#F59E0B18' }]}>
              <MaterialIcons name={mode === 'light' ? 'wb-sunny' : 'nights-stay'} size={22} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <Text style={styles.rowSub}>{mode === 'dark' ? 'On' : 'Off'}</Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: `${theme.muted}40`, true: `${theme.accent}80` }}
              thumbColor={mode === 'dark' ? theme.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* General */}
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.card}>
          {/* ── Survey Reminders (functional toggle) ── */}
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#F59E0B18' }]}>
              <MaterialIcons name="notifications" size={22} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Survey Reminders</Text>
              <Text style={styles.rowSub}>
                {remindersEnabled ? 'Enabled — draft surveys will send a reminder' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={handleRemindersToggle}
              trackColor={{ false: `${theme.muted}40`, true: '#F59E0B80' }}
              thumbColor={remindersEnabled ? '#F59E0B' : '#f4f3f4'}
            />
          </View>

          {staticGeneralItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
                  <MaterialIcons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.sub && <Text style={styles.rowSub}>{item.sub}</Text>}
                </View>
                <MaterialIcons name="chevron-right" size={22} color={theme.muted} />
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          {aboutItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
                  <MaterialIcons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.sub && <Text style={styles.rowSub}>{item.sub}</Text>}
                </View>
                <MaterialIcons name="chevron-right" size={22} color={theme.muted} />
              </View>
              {index < aboutItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.version}>Smart Field Survey App v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

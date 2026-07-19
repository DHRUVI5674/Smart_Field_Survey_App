import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticButtonPress } from '../../../utils/haptics';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppTheme } from '../../../context/ThemeContext';
import { useSurveys } from '../../../context/surveyContext';

const avatarImg = require('../../../assets/images/avatar.png');

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme, mode, toggleTheme } = useAppTheme();
  const { surveys } = useSurveys();

  const openDrawer = async () => {
    await hapticButtonPress();
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const totalSurveys = surveys.length;
  const highPriority = surveys.filter((s) => s.priority === 'High').length;
  const submitted = surveys.filter((s) => s.status === 'submitted').length;

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

    // Profile hero
    heroSection: {
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 24,
    },
    avatarRing: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarInner: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    avatarText: { fontSize: 38, fontWeight: '800', color: '#FFFFFF' },
    heroName: { fontSize: 24, fontWeight: '800', color: theme.text },
    heroRole: { fontSize: 14, color: theme.muted, marginTop: 4 },

    // Stats row
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 24,
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingVertical: 20,
      elevation: 3,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800', color: theme.text },
    statLabel: { fontSize: 12, color: theme.muted, marginTop: 4 },

    // Info cards
    infoSection: { paddingHorizontal: 20 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      paddingVertical: 4,
      paddingHorizontal: 6,
      marginBottom: 20,
      elevation: 2,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    infoIconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${theme.accent}18`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    infoLabel: { fontSize: 12, color: theme.muted },
    infoValue: { fontSize: 15, fontWeight: '600', color: theme.text, marginTop: 2 },
    divider: { height: 1, backgroundColor: `${theme.muted}20`, marginHorizontal: 14 },
    scrollContent: { paddingBottom: 40 },
  });

  const infoItems = [
    { icon: 'person', label: 'Full Name', value: 'Dhruvi Patel' },
    { icon: 'school', label: 'Department', value: 'Computer Engineering' },
    { icon: 'calendar-today', label: 'Semester', value: 'Semester 1' },
    { icon: 'email', label: 'Email', value: 'dhruvi.patel@university.edu' },
    { icon: 'phone', label: 'Phone', value: '+91 98765 43210' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={openDrawer}>
          <MaterialIcons name="menu" size={26} color={theme.accentDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={toggleTheme}>
          <MaterialIcons
            name={mode === 'light' ? 'nights-stay' : 'wb-sunny'}
            size={24}
            color={theme.accentDark}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatarRing}>
            <Image source={avatarImg} style={styles.avatarImage} />
          </View>
          <Text style={styles.heroName}>Dhruvi Patel</Text>
          <Text style={styles.heroRole}>Field Survey Inspector</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSurveys}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{highPriority}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{submitted}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            {infoItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <MaterialIcons name={item.icon} size={20} color={theme.accent} />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
                {index < infoItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

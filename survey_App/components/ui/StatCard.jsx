import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function StatCard({ label, value, icon, description }) {
  const { theme, spacing } = useAppTheme();
  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 14,
      backgroundColor: theme.surface,
      shadowColor: theme.cardShadow,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
      margin: spacing.sm,
    },
    left: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: 'rgba(14,165,255,0.06)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    icon: { fontSize: 28, color: theme.text },
    right: { flex: 1 },
    label: { color: theme.muted, fontSize: 13 },
    value: { color: theme.text, fontSize: 34, fontWeight: '700', marginTop: 4 },
    desc: { color: theme.muted, fontSize: 12, marginTop: 6 },
  });

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {description ? <Text style={styles.desc}>{description}</Text> : null}
      </View>
    </View>
  );
}

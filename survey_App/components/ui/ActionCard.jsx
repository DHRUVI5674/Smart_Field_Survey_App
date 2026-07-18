import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function ActionCard({ title, subtitle, icon, onPress }) {
  const { theme, spacing } = useAppTheme();
  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: 12,
      backgroundColor: theme.surface,
      marginBottom: spacing.sm,
      width: '48%',
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    icon: { fontSize: 20, color: theme.text },
    content: { flex: 1 },
    title: { color: theme.text, fontWeight: '700' },
    subtitle: { color: theme.muted, fontSize: 12, marginTop: 4 },
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
      backgroundColor: `${theme.accent}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    icon: { fontSize: 20, color: theme.accent },
    content: { flex: 1 },
    title: { color: theme.text, fontWeight: '700' },
    subtitle: { color: theme.muted, fontSize: 12, marginTop: 4 },
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={22} color={theme.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

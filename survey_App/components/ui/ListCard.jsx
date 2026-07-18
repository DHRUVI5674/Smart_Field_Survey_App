import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function ListCard({ survey, onPress }) {
  const { theme, spacing } = useAppTheme();
  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: 12,
      backgroundColor: theme.surface,
      marginHorizontal: spacing.sm,
      marginBottom: spacing.sm,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: 'rgba(6,99,120,0.06)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    info: { flex: 1 },
    title: { color: theme.text, fontWeight: '700' },
    sub: { color: theme.muted, fontSize: 12, marginTop: 4 },
    arrow: { color: theme.muted, fontSize: 22 },
  });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.icon}>{/* placeholder */}
        <Text style={{ fontSize: 18 }}>🏢</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{survey.siteName}</Text>
        <Text style={styles.sub}>{survey.clientName} · {survey.date}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useAppTheme } from "../../context/ThemeContext";

function SkeletonBox({ width, height, borderRadius = 8, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const { theme } = useAppTheme();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });
  const bg = theme.mode === "dark" ? "#334155" : "#e2e8f0";

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: bg, opacity }, style]}
    />
  );
}

export function SurveyCardSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.row}>
        <SkeletonBox width={50} height={50} borderRadius={14} />
        <View style={{ flex: 1, marginLeft: 14, gap: 8 }}>
          <SkeletonBox width="70%" height={16} />
          <SkeletonBox width="50%" height={12} />
        </View>
      </View>
      <View style={[styles.row, { marginTop: 12, paddingHorizontal: 2 }]}>
        <SkeletonBox width={80} height={12} />
        <SkeletonBox width={60} height={22} borderRadius={8} />
      </View>
    </View>
  );
}

export default function SkeletonList({ count = 4 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SurveyCardSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});

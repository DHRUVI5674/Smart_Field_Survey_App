import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useToast } from "../../context/ToastContext";
import { useAppTheme } from "../../context/ThemeContext";

const TYPE_COLORS = { success: "#10B981", error: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

export default function Toast() {
  const { toast, hideToast } = useToast();
  const { theme } = useAppTheme();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 100, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast]);

  if (!toast) return null;

  const accentColor = TYPE_COLORS[toast.type] || TYPE_COLORS.info;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderLeftColor: accentColor, transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <Text style={[styles.message, { color: theme.text }]} numberOfLines={2}>{toast.message}</Text>
      {toast.action && (
        <Pressable onPress={() => { toast.action.onPress(); hideToast(); }} style={[styles.actionBtn, { borderColor: accentColor }]}>
          <Text style={[styles.actionText, { color: accentColor }]}>{toast.action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute", bottom: 90, left: 16, right: 16,
    borderRadius: 14, flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 16, elevation: 10,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, borderLeftWidth: 4,
    zIndex: 9999,
  },
  accent: { width: 4, borderRadius: 2, alignSelf: "stretch", marginRight: 12 },
  message: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  actionBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 10 },
  actionText: { fontSize: 13, fontWeight: "700" },
});

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../../context/ThemeContext";

const PRESETS = {
  surveys: {
    icon: "assignment-late",
    title: "No Surveys Yet",
    subtitle: "Create your first field survey to see it here.",
    color: "#3B82F6",
  },
  search: {
    icon: "search-off",
    title: "No Matches Found",
    subtitle: "Try adjusting your search or filter criteria.",
    color: "#8B5CF6",
  },
  contacts: {
    icon: "person-search",
    title: "No Contacts Found",
    subtitle: "Your contacts will appear here once loaded.",
    color: "#F59E0B",
  },
  history: {
    icon: "history",
    title: "History is Empty",
    subtitle: "Completed surveys will show up here.",
    color: "#10B981",
  },
};

export default function EmptyState({ type = "surveys", onAction, actionLabel }) {
  const { theme } = useAppTheme();
  const preset = PRESETS[type] || PRESETS.surveys;

  return (
    <View style={styles.container}>
      <View style={[styles.iconRing, { backgroundColor: `${preset.color}15`, borderColor: `${preset.color}30` }]}>
        <View style={[styles.iconInner, { backgroundColor: `${preset.color}20` }]}>
          <MaterialIcons name={preset.icon} size={52} color={preset.color} />
        </View>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{preset.title}</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{preset.subtitle}</Text>
      {onAction && (
        <Pressable style={[styles.btn, { backgroundColor: preset.color }]} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel || "Get Started"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 30 },
  iconRing: { width: 130, height: 130, borderRadius: 65, borderWidth: 1.5, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  iconInner: { width: 96, height: 96, borderRadius: 48, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 8 },
  btn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

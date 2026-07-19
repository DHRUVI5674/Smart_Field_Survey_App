import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAppTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { hapticSubmit, hapticButtonPress } from "../../utils/haptics";

const CATEGORIES = ["Bug / Error", "UI Issue", "Missing Feature", "Performance", "Other"];

export default function ShakeReportScreen() {
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const router = useRouter();

  const [category, setCategory] = useState("Bug / Error");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast("Please describe the issue before submitting.", { type: "warning" });
      return;
    }
    await hapticButtonPress();
    setSubmitting(true);
    // Simulate submit (could POST to a server or log to AsyncStorage)
    await new Promise(r => setTimeout(r, 800));
    await hapticSubmit();
    showToast("Feedback submitted! Thank you 🙏", { type: "success" });
    setSubmitting(false);
    setMessage("");
    router.back();
  };

  const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: theme.text },
    shakeHint: { marginHorizontal: 20, marginBottom: 20, backgroundColor: `${theme.accent}12`, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
    shakeHintText: { fontSize: 13, color: theme.accent, fontWeight: "600", flex: 1 },
    label: { fontSize: 13, fontWeight: "600", color: theme.muted, marginBottom: 8, marginHorizontal: 20 },
    categoriesRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginBottom: 20 },
    catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.surface },
    catChipActive: { backgroundColor: theme.accent },
    catText: { fontSize: 13, fontWeight: "600", color: theme.muted },
    catTextActive: { color: "#FFF" },
    textarea: {
      backgroundColor: theme.surface, color: theme.text, fontSize: 15,
      padding: 16, borderRadius: 14, marginHorizontal: 20, minHeight: 140,
      textAlignVertical: "top", marginBottom: 24,
    },
    submitBtn: {
      marginHorizontal: 20, backgroundColor: theme.accent, padding: 16,
      borderRadius: 14, alignItems: "center", flexDirection: "row",
      justifyContent: "center", gap: 8,
    },
    submitText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  });

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.accentDark} />
        </Pressable>
        <Text style={s.headerTitle}>Report an Issue</Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={s.shakeHint}>
          <Text style={{ fontSize: 24 }}>📳</Text>
          <Text style={s.shakeHintText}>You triggered this by shaking your phone. Tell us what went wrong!</Text>
        </View>

        <Text style={s.label}>Category</Text>
        <View style={s.categoriesRow}>
          {CATEGORIES.map(c => (
            <Pressable key={c} style={[s.catChip, category === c && s.catChipActive]} onPress={() => setCategory(c)}>
              <Text style={[s.catText, category === c && s.catTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>Describe the issue</Text>
        <TextInput
          style={s.textarea}
          value={message}
          onChangeText={setMessage}
          placeholder="What happened? What did you expect to happen?"
          placeholderTextColor={theme.muted}
          multiline
          maxLength={500}
        />

        <Pressable style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
          <MaterialIcons name="send" size={20} color="#FFF" />
          <Text style={s.submitText}>{submitting ? "Sending..." : "Submit Feedback"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

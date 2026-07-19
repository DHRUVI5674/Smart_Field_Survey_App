import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSurveys } from "../../context/surveyContext";
import { useAppTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { hapticButtonPress } from "../../utils/haptics";

export default function QRSurveyScreen() {
  const { surveyId } = useLocalSearchParams();
  const { surveys } = useSurveys();
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const router = useRouter();

  const survey = surveys.find(s => s.id === surveyId);

  if (!survey) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Survey not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.accent, fontWeight: "700" }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const qrData = JSON.stringify({
    id: survey.id,
    siteName: survey.siteName,
    clientName: survey.clientName,
    priority: survey.priority,
    date: survey.date,
    status: survey.status,
  });

  const handleShare = async () => {
    await hapticButtonPress();
    try {
      await Share.share({
        message: `📋 Survey: ${survey.siteName}\nClient: ${survey.clientName}\nPriority: ${survey.priority}\nDate: ${survey.date}\nID: ${survey.id}`,
        title: `Survey – ${survey.siteName}`,
      });
    } catch (e) {
      showToast("Unable to share at this time.", { type: "error" });
    }
  };

  const s = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: theme.text },
    qrCard: { marginHorizontal: 20, backgroundColor: theme.surface, borderRadius: 20, padding: 28, alignItems: "center", elevation: 4, shadowColor: theme.cardShadow, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    qrLabel: { fontSize: 13, color: theme.muted, fontWeight: "600", marginBottom: 20 },
    qrWrapper: { padding: 16, backgroundColor: "#FFFFFF", borderRadius: 16 },
    surveyId: { fontSize: 13, color: theme.muted, marginTop: 20, letterSpacing: 1 },
    infoCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: theme.surface, borderRadius: 16, padding: 18, gap: 10 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    infoLabel: { fontSize: 13, color: theme.muted },
    infoValue: { fontSize: 14, fontWeight: "700", color: theme.text },
    shareBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: theme.accent, padding: 16, borderRadius: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
    shareText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  });

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.accentDark} />
        </Pressable>
        <Text style={s.headerTitle}>Survey QR Code</Text>
      </View>
      <ScrollView>
        <View style={s.qrCard}>
          <Text style={s.qrLabel}>Scan to view survey details</Text>
          <View style={s.qrWrapper}>
            <QRCode value={qrData} size={200} color="#1e293b" backgroundColor="#FFFFFF" />
          </View>
          <Text style={s.surveyId}>{survey.id}</Text>
        </View>

        <View style={s.infoCard}>
          {[
            ["Site", survey.siteName],
            ["Client", survey.clientName],
            ["Priority", survey.priority],
            ["Date", survey.date],
            ["Status", survey.status],
          ].map(([label, value]) => (
            <View key={label} style={s.infoRow}>
              <Text style={s.infoLabel}>{label}</Text>
              <Text style={s.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Pressable style={s.shareBtn} onPress={handleShare}>
          <MaterialIcons name="share" size={20} color="#FFF" />
          <Text style={s.shareText}>Share Survey</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

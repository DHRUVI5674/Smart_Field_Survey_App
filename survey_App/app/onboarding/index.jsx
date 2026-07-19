import React, { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "assignment",
    color: "#3B82F6",
    bg: "#EFF6FF",
    title: "Smart Field Surveys",
    subtitle: "Create, manage and submit field inspection surveys with rich details — photos, GPS, contacts and more.",
  },
  {
    id: "2",
    icon: "auto-awesome",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    title: "AI-Powered Assistance",
    subtitle: "Smart priority suggestions, inline validation, and auto-save drafts so you never lose your work.",
  },
  {
    id: "3",
    icon: "emoji-events",
    color: "#F59E0B",
    bg: "#FFFBEB",
    title: "Earn Achievements",
    subtitle: "Track your inspection streak, earn badges, and see your weekly progress — gamified for motivation.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem("@onboarding_done", "true");
      router.replace("/(drawer)/(tabs)/");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("@onboarding_done", "true");
    router.replace("/(drawer)/(tabs)/");
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconRing, { backgroundColor: item.bg }]}>
        <View style={[styles.iconInner, { backgroundColor: `${item.color}20` }]}>
          <MaterialIcons name={item.icon} size={72} color={item.color} />
        </View>
      </View>
      <Text style={[styles.title, { color: "#1e293b" }]}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={e => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        <View style={styles.dotsTrack}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? "#3B82F6" : "#CBD5E1" }]} />
          ))}
        </View>
      </View>

      <Pressable style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>{currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}</Text>
        <MaterialIcons name={currentIndex === SLIDES.length - 1 ? "check" : "arrow-forward"} size={20} color="#FFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  skipBtn: { alignSelf: "flex-end", paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  skipText: { fontSize: 14, fontWeight: "600", color: "#94A3B8" },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 36, paddingTop: 20 },
  iconRing: { width: 180, height: 180, borderRadius: 90, justifyContent: "center", alignItems: "center", marginBottom: 40 },
  iconInner: { width: 140, height: 140, borderRadius: 70, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  subtitle: { fontSize: 16, color: "#64748B", textAlign: "center", lineHeight: 26 },
  dotsContainer: { paddingVertical: 20, alignItems: "center" },
  dotsTrack: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: {
    marginHorizontal: 24, marginBottom: 16, backgroundColor: "#3B82F6",
    padding: 16, borderRadius: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, elevation: 4,
    shadowColor: "#3B82F6", shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  nextText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});

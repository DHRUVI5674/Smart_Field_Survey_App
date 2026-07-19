import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function ConfettiOverlay({ visible, onDone }) {
  const cannon = useRef(null);

  useEffect(() => {
    if (visible && cannon.current) {
      cannon.current.start();
      const t = setTimeout(() => onDone && onDone(), 2500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ConfettiCannon
        ref={cannon}
        count={180}
        origin={{ x: 0, y: -10 }}
        autoStart={false}
        fadeOut
        fallSpeed={2800}
        explosionSpeed={350}
        colors={["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"]}
      />
      <ConfettiCannon
        count={120}
        origin={{ x: 400, y: -10 }}
        autoStart
        fadeOut
        fallSpeed={2600}
        explosionSpeed={380}
        colors={["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"]}
      />
    </View>
  );
}

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getTypeColor } from "../../utils/type-colors";

interface PokeTypeBadgeProps {
  type: string;
  size?: "small" | "medium" | "large";
}

export default function PokeTypeBadge({
  type,
  size = "medium",
}: PokeTypeBadgeProps) {
  const backgroundColor = getTypeColor(type);

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      fontSize: 10,
      borderRadius: 10,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      fontSize: 12,
      borderRadius: 12,
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      borderRadius: 14,
    },
  }[size];

  return (
    <View style={[styles.badge, { backgroundColor }, sizeStyles]}>
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>
        {type.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: "#000000",
  },
});

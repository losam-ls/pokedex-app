import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export default function EntryScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoNavigate();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAutoNavigate = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(tabs)");
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <FontAwesome name="bolt" size={120} color="white" style={styles.icon} />
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>Gotta catch 'em all!</Text>
      <Text style={styles.countdownText}>Loading your Pokédex...</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
    padding: 20,
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 30,
    fontStyle: "italic",
  },
  countdownText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 20,
  },
});

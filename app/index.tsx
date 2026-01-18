import { FontAwesome } from "@expo/vector-icons"; // Using icon instead
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EntryScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="bolt" size={120} color="white" style={styles.icon} />
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>Gotta catch 'em all!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Enter Pokédex</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF0000",
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
    marginBottom: 50,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: "#FF0000",
    fontSize: 20,
    fontWeight: "bold",
  },
});

import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "pink",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color="grey" />
          ),
        }}
      />

      <Tabs.Screen
        name="favourite"
        options={{
          headerTitle: "Favourites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={24} color="grey" />
          ),
        }}
      />
    </Tabs>
  );
}

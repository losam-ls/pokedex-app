import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryProvider } from "@/utils/queries";

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false, 
          }}
        >
        </Stack>
      </SafeAreaProvider>
    </QueryProvider>
  );
}

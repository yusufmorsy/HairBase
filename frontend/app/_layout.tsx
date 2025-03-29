import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await AsyncStorage.getItem("onboarding-complete");
      if (!completed) {
        router.replace("/onboarding");
      }
    };
    checkOnboardingStatus();
  }, []);

  return (
    <>
      <Stack screenOptions={{ navigationBarColor: "#fff" }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ title: "Scan Product" }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

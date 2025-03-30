import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { ProductContext } from "@/providers/ProductContext";

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

  AsyncStorage.getAllKeys().then(console.log);

  return (
    <>
      <Stack
        screenOptions={{
          navigationBarColor: "#ffffff00",
          navigationBarTranslucent: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Results" }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="manualfill" options={{ headerShown: true, title: "Manual Fill" }} />
        <Stack.Screen
            name="products"
            options={{ title: "Product Information" }}
          />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ProductContext } from "@/providers/ProductContext";
import { ImageContext } from "@/providers/ImageContext";
import { Product } from "@/types/Product";
import { HistoryContext } from "@/providers/HistoryContext";

export default function RootLayout() {
  const [image, setImage] = useState<string>();
  const [historyProducts, setHistoryProducts] = useState<Product[]>([]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await AsyncStorage.getItem("onboarding-complete");
      if (!completed) {
        router.replace("/onboarding");
      }
    };
    const loadProductHistory = async () => {
      const data = await AsyncStorage.getItem("product-history");
      if (data) {
        setHistoryProducts(JSON.parse(data));
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    const saveHistory = async () => {
      await AsyncStorage.setItem(
        "product-history",
        JSON.stringify(historyProducts)
      );
    };

    saveHistory();
  }, [historyProducts]);

  return (
    <>
      <ImageContext.Provider value={{ image, setImage }}>
        <HistoryContext.Provider
          value={{ historyProducts, setHistoryProducts }}
        >
          <Stack
            screenOptions={{
              navigationBarColor: "#ffffff00",
              navigationBarTranslucent: true,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, title: "Results" }}
            />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="form" options={{ title: "Add a Product" }} />
            <Stack.Screen
              name="products"
              options={{ title: "Product Information" }}
            />
          </Stack>
          <StatusBar style="dark" />
        </HistoryContext.Provider>
      </ImageContext.Provider>
    </>
  );
}

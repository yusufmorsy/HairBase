import ScannerLink from "@/components/ScannerLink";
import SearchBar from "@/components/SearchBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <ScannerLink />,
        }}
      />
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{ padding: 16 }}
      >
        <SearchBar />
        <Pressable
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace("/onboarding");
          }}
        >
          <Text>Clear Local Storage</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexBasis: "auto",
    gap: 16,
  },
  searchContainer: {
    flex: 1,
  },
});

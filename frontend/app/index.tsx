import SearchBar from "@/components/SearchBar";
import Feather from "@expo/vector-icons/Feather";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>
        <Link href="/scan">
          <Feather name="camera" size={18} color="#858585" />
        </Link>
      </View>
    </View>
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

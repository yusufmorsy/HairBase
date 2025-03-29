import SearchBar from "@/components/SearchBar";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <SearchBar />
    </View>
  );
}

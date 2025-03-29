import { StyleSheet, TextInput, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search..."
        style={styles.input}
        placeholderTextColor="#858585"
      />
      <Feather name="search" color="#858585" size={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: "#858585",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 18,
    flex: 1,
    color: "#858585",
  },
});

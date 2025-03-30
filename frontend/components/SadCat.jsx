import { FontAwesome6 } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

export default function SadCat() {
  return (
    <View style={styles.container}>
      <FontAwesome6 name="cat" color="#c1c1c1" size={32} />
      <Text style={styles.text}>Not Found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
  },
  text: {
    fontSize: 18,
    color: "#c1c1c1",
  },
});

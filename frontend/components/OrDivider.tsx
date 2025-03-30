import { View, Text, StyleSheet } from "react-native";

export default function OrDivider() {
  return (
    <View style={styles.view}>
      <View style={styles.line} />
      <Text style={styles.text}>or</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    backgroundColor: "#c1c1c1",
    flex: 1,
    height: 1,
  },
  text: {
    color: "#c1c1c1",
    fontSize: 11,
  },
});

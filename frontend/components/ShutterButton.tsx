import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  onPress?: () => void;
};

export default function ShutterButton({ onPress }: Props) {
  return (
    <View style={styles.outerContainer}>
      <Pressable style={styles.pressable} onPress={onPress}>
        <View style={styles.innerContainer}>
          <Feather name="camera" size={32} color="#" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    alignContent: "center",
    justifyContent: "center",
    height: 64,
    width: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#fff",
    padding: 4,
    bottom: 16,
    alignSelf: "center",
  },
  pressable: {
    flex: 1,
  },
  innerContainer: {
    backgroundColor: "#fff",
    flex: 1,
    borderRadius: 100,
  },
});

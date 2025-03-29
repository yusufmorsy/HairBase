import { ReactElement } from "react";
import { StyleSheet } from "react-native";
import { Pressable, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type IconFunction = {
  size: number;
  color: string;
};

type Props = {
  text: string;
  icon?: ({ size, color }: IconFunction) => ReactElement;
  onPress?: () => void;
};

export default function Button({ text, icon, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={["#76a1e2", "#84aeed"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.text}>{text}</Text>
        {icon && icon({ color: "#fff", size: 18 })}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "#fff",
  },
});

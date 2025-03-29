import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

type Props = {
  selected: boolean;
  onChangeSelected: (selected: boolean) => void;
  text: string;
};

export default function MultipleChoiceItem({
  text,
  selected,
  onChangeSelected,
}: Props) {
  const [checked, setChecked] = useState<boolean>(selected);
  const toggleSelection = () => {
    setChecked(!checked);
    onChangeSelected(!checked);
  };

  return (
    <Pressable onPress={toggleSelection}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: checked ? "#76a1e2" : "#fffff",
          },
        ]}
      >
        <Feather
          name={checked ? "check-circle" : "circle"}
          size={18}
          color={checked ? "#ffffff" : "#76a1e2"}
        />
        <Text
          style={{
            color: checked ? "#ffffff" : "#76a1e2",
          }}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 16,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#76a1e2",
    padding: 8,
  },
  text: {
    fontSize: 18,
  },
});

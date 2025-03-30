import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

type Props = {
  options: string[];
  selectedOptions: string[];
  onUpdate: (value: string[]) => void;
  label: string;
};

export default function Checklist({
  options,
  selectedOptions,
  onUpdate,
  label,
}: Props) {
  const [selected, setSelected] = useState<string[]>(selectedOptions);

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      const val = selected.filter((o) => o != option);
      setSelected(val);
      onUpdate(val);
    } else {
      const val = [...selected, option];
      setSelected(val);
      onUpdate(val);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.optionListContainer}>
        {options.map((option) => (
          <Pressable onPress={() => toggle(option)} key={option}>
            <View style={styles.optionContainer}>
              <Feather
                name={selected.includes(option) ? "check-square" : "square"}
                size={18}
              />
              <Text style={styles.optionText}>{option}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  label: {
    fontSize: 18,
  },
  input: {},
  optionListContainer: {
    gap: 8,
  },
  optionContainer: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#858585",
    borderRadius: 8,
  },
  optionText: {
    fontSize: 18,
  },
});

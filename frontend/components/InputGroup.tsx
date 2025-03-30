import { TextInput, Text, View, StyleSheet } from "react-native";

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (value: string) => void;
};

export default function InputGroup({
  label,
  value,
  placeholder,
  onChangeText,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
        />
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
  input: {
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputContainer: {
    borderColor: "#858585",
    borderWidth: 1,
    borderRadius: 8,
  },
});

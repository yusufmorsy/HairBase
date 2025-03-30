import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search..."
        style={styles.input}
        placeholderTextColor="#858585"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        blurOnSubmit={true}
      />
      <TouchableOpacity onPress={handleSearch}>
        <Feather name="search" color="#858585" size={18} />
      </TouchableOpacity>
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
    flex: 1,
  },
  input: {
    fontSize: 18,
    flex: 1,
    color: "#858585",
  },
});

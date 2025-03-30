import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function History() {
  const [scannedProducts, setScannedProducts] = useState<string[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem("scannedProducts");
        if (storedHistory !== null) {
          setScannedProducts(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load scan history:", error);
      }
    };

    loadHistory();
  }, []);

  // Explicitly type the destructured parameter as a string.
  const renderItem = ({ item }: { item: string }) => (
    <Text style={styles.item}>Product ID: {item}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>
      {scannedProducts.length === 0 ? (
        <Text style={styles.empty}>No scans yet</Text>
      ) : (
        <FlatList
          data={scannedProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  empty: {
    fontSize: 16,
    color: "gray",
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
  },
});

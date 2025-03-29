import ScannerLink from "@/components/ScannerLink";
import SearchBar from "@/components/SearchBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import React, { useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  rating: number;
  hairTexture: string;
  imageUrl: string;
  benefits: string;
  concerns: string;
  hairTypes: string;
}

// Sample product data; in a real app this might come from an API
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Hydrating Shampoo",
    brand: "HairCare Pro",
    rating: 4.5,
    hairTexture: "curly",
    imageUrl: "https://via.placeholder.com/300x200",
    benefits: "Moisturizes and defines curls.",
    concerns: "Frizz reduction and hydration.",
    hairTypes: "Curly, coily",
  },
  {
    id: "2",
    name: "Volume Boost Conditioner",
    brand: "StyleMax",
    rating: 4.0,
    hairTexture: "wavy",
    imageUrl: "https://via.placeholder.com/300x200",
    benefits: "Adds volume and shine.",
    concerns: "Dryness and dullness.",
    hairTypes: "Wavy, straight",
  },
  // add more products as needed
];

const ProductCard = ({ product }: { product: Product }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
        </View>
        <Text style={styles.rating}>⭐ {product.rating}</Text>
      </View>
      <Text style={styles.hairTexture}>Ideal for: {product.hairTexture} hair</Text>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={styles.expandText}>{expanded ? "Show Less" : "Show More"}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailText}>Benefits: {product.benefits}</Text>
          <Text style={styles.detailText}>Concerns: {product.concerns}</Text>
          <Text style={styles.detailText}>Hair Types: {product.hairTypes}</Text>
        </View>
      )}
    </View>
  );
};


export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <ScannerLink />,
        }}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <SearchBar />
          <Pressable
            onPress={async () => {
              await AsyncStorage.clear();
              router.replace("/onboarding");
            }}
          >
            <Text style={styles.clearText}>Clear Local Storage</Text>
          </Pressable>
        </View>

        {/* Products Section */}
        <View style={styles.productsContainer}>
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 16,
  },
  clearText: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
  productsContainer: {
    marginTop: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productBrand: {
    fontSize: 14,
    color: "gray",
  },
  rating: {
    fontSize: 14,
  },
  hairTexture: {
    fontSize: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  expandText: {
    fontSize: 14,
    color: "blue",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  expandedContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
  },
});
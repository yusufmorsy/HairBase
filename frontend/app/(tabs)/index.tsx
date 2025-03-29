import ScannerLink from "@/components/ScannerLink";
import SearchBar from "@/components/SearchBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";

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
      <Text style={styles.hairTexture}>
        Ideal for: {product.hairTexture} hair
      </Text>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={styles.expandText}>
          {expanded ? "Show Less" : "Show More"}
        </Text>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null); // For debugging

  useEffect(() => {
    (async () => {
      try {
        // Use a query that returns a product. Adjust the query as needed.
        const res = await fetch(
          "https://blasterhacks.lenixsavesthe.world/search?query=shampoo"
        );
        const data = await res.json();

        console.log("API response:", data);
        setApiResponse(data); // Save the raw response for debugging

        let productsArray = [];
        // Since the API returns an array of arrays, assign directly:
        if (Array.isArray(data)) {
          productsArray = data;
        } else {
          console.error("Unexpected data format:", data);
        }

        // Transform API data (which is an array) to match your Product interface.
        // Use a fallback placeholder for the image URL.
        const transformed = productsArray.map((item: any) => ({
          id: String(item[0]),
          name: item[1] || "",
          brand: item[2] || "",
          rating: item[3] || 0,
          hairTexture: "all", // Default value since not provided by API
          imageUrl:
            "data:image/jpeg;base64,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", // Fallback image URL
          benefits: "N/A",
          concerns: "N/A",
          hairTypes: "N/A",
        }));

        setProducts(transformed);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

        {/* Debugging: Render raw API response */}
        {apiResponse && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12 }}>
              API Response: {JSON.stringify(apiResponse)}
            </Text>
          </View>
        )}

        {/* Products Section */}
        <View style={styles.productsContainer}>
          {products.length === 0 ? (
            <Text style={{ fontSize: 16, textAlign: "center", marginTop: 20 }}>
              No products found.
            </Text>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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

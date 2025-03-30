import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import { Product } from "@/types/Product";

interface IProduct {
  id: number;
  name: string;
  brand: string;
  rating: number;
  hairTexture: string;
  imageUrl: string;
  concerns: string;
  hairTypes: string;
}

const ProductCard = ({ product }: { product: IProduct }) => {
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
      <Text style={styles.hairTexture}>Ideal for: {product.hairTexture}</Text>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={styles.expandText}>
          {expanded ? "Show Less" : "Show More"}
        </Text>
      </Pressable>
      {expanded && (
        <View style={styles.expandedContent}>
          {/* <Text style={styles.detailText}>Benefits: {product.benefits}</Text> */}
          <Text style={styles.detailText}>Concerns: {product.concerns}</Text>
          <Text style={styles.detailText}>Hair Types: {product.hairTypes}</Text>
        </View>
      )}
    </View>
  );
};

export default function History() {
  const [historyProducts, setHistoryProducts] = useState<IProduct[]>([]);
  const [addedContributionsCount, setAddedContributionsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        // Retrieve the scanned product IDs from AsyncStorage.
        const savedProds: string = (await AsyncStorage.getItem("product-history")) || "";
        const parsedProds: Product[] = JSON.parse(savedProds) as Product[]

        // let scannedIds: string[] = [];
        // if (storedHistory !== null) {
        //   scannedIds = JSON.parse(storedHistory);
        // }



        // For each scanned product id, call the search API.
        const fetchPromises = parsedProds.map((product) => {
            return {
              id: product.product_id,
              name: product.product_name || "Unknown Product",
              brand: product.brand_name || "N/A",
              rating: 0 || 0,
              hairTexture: product.textures || "N/A",
              imageUrl: product.image_url || "https://via.placeholder.com/200",
              concerns: product.concerns || "N/A",
              hairTypes: product.types || "N/A",
            } as IProduct;
        });

        const fetchedProducts = await Promise.all(fetchPromises);
        setHistoryProducts(fetchedProducts);
        // Count the ones that are "Unknown Product" (i.e. not found in the database).
        const addedCount = fetchedProducts.filter(
          (p) => p.name === "Unknown Product"
        ).length;
        setAddedContributionsCount(addedCount);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "History",
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Clear Button */}
          <Pressable
            style={styles.clearButton}
            onPress={async () => {
              await AsyncStorage.clear();
              router.replace("/onboarding");
            }}
          >
            <Text style={styles.clearText}>Clear Local Storage</Text>
          </Pressable>

          {/* Header with added contributions count */}
          <Text style={styles.header}>
            You have made {addedContributionsCount} added contributions to HairBase
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : historyProducts.length === 0 ? (
            <Text style={styles.empty}>No scans yet</Text>
          ) : (
            historyProducts.map((product, index) => (
              <ProductCard key={product.id || index.toString()} product={product} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
  },
  clearButton: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  clearText: {
    fontSize: 14,
    color: "red",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
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

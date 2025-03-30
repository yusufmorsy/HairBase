import React, { useState, useEffect, useContext } from "react";
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
import { HistoryContext } from "@/providers/HistoryContext";
import ProductSkeleton from "@/components/ProductSkeleton";
// Removed incorrect import for IProduct from "@/types/Product"

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

  // Navigate to the product detail page using the dynamic route.
  const handleCardPress = () => {
    router.push({
      pathname: "/products/[productId]",
      params: { productId: product.id.toString() },
    });
  };

  return (
    <View style={styles.card}>
      {/* Pressable area for all content except the "Show More" button */}
      <Pressable onPress={handleCardPress} style={styles.cardContent}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
          </View>
        </View>
        <Text style={styles.hairTexture}>Ideal for: {product.hairTexture}</Text>
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.detailText}>Concerns: {product.concerns}</Text>
            <Text style={styles.detailText}>
              Hair Types: {product.hairTypes}
            </Text>
          </View>
        )}
      </Pressable>
      {/* Show More / Show Less button */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation(); // Prevent the card press action
          setExpanded(!expanded);
        }}
        style={styles.expandButton}
      >
        <Text style={styles.expandText}>
          {expanded ? "Show Less" : "Show More"}
        </Text>
      </Pressable>
    </View>
  );
};

export default function History() {
  const { historyProducts } = useContext(HistoryContext);

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

          {historyProducts.length === 0 ? (
            <Text style={styles.empty}>No scans yet</Text>
          ) : (
            [...historyProducts].reverse().map((product, index) => (
              <ProductCard
                key={product.product_id || index.toString()}
                product={{
                  id: product.product_id,
                  imageUrl:
                    product?.image_url || "https://via.placeholder.com/200",
                  brand: product.brand_name,
                  concerns: product.concerns?.join(", ") || "",
                  hairTexture: product.textures?.length
                    ? product.textures.join(", ")
                    : "N/A",
                  hairTypes: product.types?.length
                    ? product.types.join(", ")
                    : "N/A",
                  name: product.product_name,
                  rating: 1,
                }}
              />
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
  cardContent: {
    flex: 1,
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
  hairTexture: {
    fontSize: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  expandButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    color: "blue",
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

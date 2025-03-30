import { Product } from "@/types/Product";
import { Image } from "expo-image";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserPreferences {
  hairTypes: string[];
  hairTextures: string[];
  ingredients: string[];
}

export default function ShowProduct() {
  const globalParams = useGlobalSearchParams();
  const product_id = globalParams.productId;

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Check if any of the product values match the user preferences (case-insensitive)
  const hasMatch = (productItems: string[], preferenceItems: string[]): boolean => {
    if (!Array.isArray(productItems)) return false;
    return productItems.some(item =>
      preferenceItems.some(pref => item.toLowerCase() === pref.toLowerCase())
    );
  };

  // Helper function to join array items with a comma
  const joinWithComma = (data: any) =>
    Array.isArray(data) ? data.join(", ") : data;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `https://blasterhacks.lenixsavesthe.world/show_product?product_id=${product_id}`
        );
        const p: Product = await response.json();
        console.log(p);
        setProduct(p);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchUserPreferences = async () => {
      try {
        const prefString = await AsyncStorage.getItem("userPreferences");
        if (prefString) {
          const prefs: UserPreferences = JSON.parse(prefString);
          setUserPreferences(prefs);
        } else {
          // If no preferences are found, you can set some defaults or handle it accordingly
          const defaultPrefs: UserPreferences = {
            hairTypes: [],
            hairTextures: [],
            ingredients: [],
          };
          setUserPreferences(defaultPrefs);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchProduct();
    fetchUserPreferences();
  }, [product_id]);

  // Only render if both product and user preferences are available
  if (!product || !userPreferences) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.productName}>{product.product_name}</Text>
            <Text style={styles.productBrand}>{product.brand_name}</Text>
          </View>
        </View>
        {product.textures && (
          <Text style={styles.hairTexture}>
            Ideal for: {joinWithComma(product.textures)}{" "}
            {hasMatch(product.textures, userPreferences.hairTextures) ? (
              <Text style={styles.check}>✓</Text>
            ) : (
              <Text style={styles.x}>✗</Text>
            )}
          </Text>
        )}
        <View style={styles.expandedContent}>
          {product.ingredients && (
            <Text style={styles.detailText}>
              Ingredient Details: {joinWithComma(product.ingredients)}{" "}
              {hasMatch(product.ingredients, userPreferences.ingredients) ? (
                <Text style={styles.check}>✓</Text>
              ) : (
                <Text style={styles.x}>✗</Text>
              )}
            </Text>
          )}
          {product.concerns && (
            <Text style={styles.detailText}>
              Concerns: {joinWithComma(product.concerns)}
            </Text>
          )}
          {product.types && (
            <Text style={styles.detailText}>
              Hair Types: {joinWithComma(product.types)}{" "}
              {hasMatch(product.types, userPreferences.hairTypes) ? (
                <Text style={styles.check}>✓</Text>
              ) : (
                <Text style={styles.x}>✗</Text>
              )}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  productBrand: {
    fontSize: 18,
    color: "#858585",
  },
  hairTexture: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  expandedContent: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  check: {
    color: "green",
    fontSize: 20,
    marginLeft: 4,
  },
  x: {
    color: "red",
    fontSize: 20,
    marginLeft: 4,
  },
});

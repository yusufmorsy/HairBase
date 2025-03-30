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
import { Product } from "@/types/Product";
import { HistoryContext } from "@/providers/HistoryContext";
import ProductTile from "@/components/ProductTile";

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

          {/* Header with added contributions count */}
          {/* <Text style={styles.header}>
            You have made {addedContributionsCount} added contributions to
            HairBase
          </Text> */}

          {historyProducts.length === 0 ? (
            <Text style={styles.empty}>No scans yet</Text>
          ) : (
            historyProducts.map((product, index) => (
              // <ProductCard
              //   key={product.id || index.toString()}
              //   product={product}
              // />
              <ProductTile product={product} key={index} />
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

import ScannerLink from "@/components/ScannerLink";
import SearchBar from "@/components/SearchBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router, Stack } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import ProductTile from "@/components/ProductTile";
import { Product } from "@/types/Product";

// const ProductCard = ({ product }: { product: Product }) => {
//   const [expanded, setExpanded] = useState(false);

//   const handleCardPress = () => {
//     // Navigate using the allowed route with matching param name.
//     router.push({
//       pathname: "/products/[productId]",
//       params: { productId: product.id },
//     });
//   };

//   return (
//     <Pressable onPress={handleCardPress} style={styles.card}>
//       <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
//       <View style={styles.cardHeader}>
//         <View>
//           <Text style={styles.productName}>{product.name}</Text>
//           <Text style={styles.productBrand}>{product.brand}</Text>
//         </View>
//       </View>
//       <Text style={styles.hairTexture}>Ideal for: {product.hairTexture}</Text>
//       <Pressable
//         onPress={(e) => {
//           // Prevent card press if tapping the "Show More" button.
//           e.stopPropagation();
//           setExpanded(!expanded);
//         }}
//       >
//         <Text style={styles.expandText}>
//           {expanded ? "Show Less" : "Show More"}
//         </Text>
//       </Pressable>
//       {expanded && (
//         <View style={styles.expandedContent}>
//           <Text style={styles.detailText}>
//             Ingredient Details: {product.benefits}
//           </Text>
//           <Text style={styles.detailText}>Concerns: {product.concerns}</Text>
//           <Text style={styles.detailText}>Hair Types: {product.hairTypes}</Text>
//         </View>
//       )}
//     </Pressable>
//   );
// };

export default function Index() {
  // Store the current search query; default is "shampoo"
  const [query, setQuery] = useState("shampoo");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(
        `https://blasterhacks.lenixsavesthe.world/search?query=${query}`
      );
      const products: Product[] = await res.json();
      console.log(products);
      setProducts(products);
    };

    fetchProducts();
  }, [query]);

  return (
    <>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <SearchBar onSearch={setQuery} />
        </View>

        {/* Products Section */}
        <View style={styles.productsContainer}>
          {products.length === 0 ? (
            <Text style={styles.noProductsText}>No products found.</Text>
          ) : (
            products
              .slice(1, 20)
              .map((product: Product) => (
                <ProductTile product={product} key={product.product_id} />
              ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background for the whole page.
  },
  contentContainer: {
    padding: 60,
  },
  headerSection: {
    marginBottom: 16,
  },
  productsContainer: {
    marginTop: 20,
    gap: 32,
  },
  noProductsText: {
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

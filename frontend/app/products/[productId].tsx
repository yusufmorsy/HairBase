import { Product } from "@/types/Product";
import { Image } from "expo-image";
import { Stack, useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ShowProduct() {
  const globalParams = useGlobalSearchParams();
  const product_id = globalParams.productId;

  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(
        `https://blasterhacks.lenixsavesthe.world/show_product?product_id=${product_id}`
      );
      const p: Product = await response.json();
      console.log(p);
      setProduct(p);
    };
    fetchProduct();
  }, []);

  return (
    <>
      <View style={styles.page}>
        <View style={styles.header}>
          {product && <Image source={product.image_url} style={styles.image} />}
          {product && (
            <View style={styles.textContainer}>
              <Text>
                {product && (
                  <Text style={styles.productName}>{product.product_name}</Text>
                )}
              </Text>
              <Text>
                {product && (
                  <Text style={styles.brandName}>{product.brand_name}</Text>
                )}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
  },
  image: {
    borderRadius: 8,
    width: 96,
    aspectRatio: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  brandName: {
    fontSize: 14,
    color: "#858585",
  },
  textContainer: {
    gap: 4,
    flex: 1,
  },
});

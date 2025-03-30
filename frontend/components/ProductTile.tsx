import { Product } from "@/types/Product";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  product: Product;
};

export default function ProductTile({ product }: Props) {
  console.log(product);

  return (
    <View style={styles.outerContainer}>
      <Image style={styles.picture} source={product.image_url} />
      <View style={styles.textContainer}>
        <Text style={styles.productName}>{product.product_name}</Text>
        <Text style={styles.brandName}>{product.brand_name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    gap: 16,
  },
  picture: {
    height: 200,
    backgroundColor: "#c1c1c1",
    borderRadius: 8,
  },
  textContainer: {
    alignItems: "flex-start",
    gap: 8,
  },
  nameTextBar: {
    height: 18,
  },
  brandTextBar: {
    height: 18,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  brandName: {
    fontSize: 14,
    color: "#858585",
  },
});

import { Product } from "@/types/Product";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";
import LikeButton from "./LikeButton";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

type Props = {
  product: Product;
};

export default function ProductTile({ product }: Props) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.outerContainer}>
        <Image style={styles.picture} source={product.image_url} />
        <View style={styles.textContainer}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.brandName}>{product.brand_name}</Text>
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: "row",
    gap: 16,
  },
  picture: {
    height: 64,
    width: 64,
    backgroundColor: "#c1c1c1",
    borderRadius: 8,
  },
  textContainer: {
    alignItems: "flex-start",
    gap: 4,
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  brandName: {
    fontSize: 12,
    color: "#858585",
  },
});

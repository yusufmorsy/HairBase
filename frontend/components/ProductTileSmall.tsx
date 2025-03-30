import { Product } from "@/types/Product";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";
import LikeButton from "./LikeButton";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";

type Props = {
  product: Product;
};

export default function ProductTile({ product }: Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.outerContainer}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.textContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.brandName}>{product.brand}</Text>
        </View>
        <View>
          <LikeButton count={16} />
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
  imagePlaceholder: {
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
    fontSize: 18,
    fontWeight: "bold",
  },
  brandName: {
    fontSize: 14,
    color: "#858585",
  },
});

import Button from "@/components/Button";
import Checklist from "@/components/Checklist";
import InputGroup from "@/components/InputGroup";
import { ImageContext } from "@/providers/ImageContext";
import { Product } from "@/types/Product";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyFormyPage() {
  const [productName, setProductName] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [textures, setTextures] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const { image } = useContext(ImageContext);

  const addProduct = async () => {
    let resp = await fetch(
      "https://blasterhacks.lenixsavesthe.world/add_product",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: productName,
          brand_name: brandName,
          textures,
          types,
          ingredients,
          concerns,
          image,
        }),
      }
    );

    const { productId } = await resp.json();

    resp = await fetch(
      `https://blasterhacks.lenixsavesthe.world/show_product?product_id=${productId}`
    );

    const product: Product = await resp.json();

    const prods = (await AsyncStorage.getItem("product-history")) || "";
    const history = JSON.parse(prods) as Product[];
    history.push(product);
    await AsyncStorage.setItem("product-history", JSON.stringify(history));

    router.replace("/history");
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.page}>
      <InputGroup
        label="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <InputGroup
        label="Brand Name"
        value={brandName}
        onChangeText={setBrandName}
      />
      <Button
        text="Submit"
        icon={({ color, size }) => (
          <Feather name="check" size={size} color={color} />
        )}
        onPress={addProduct}
      />
      <Checklist
        label="Hair Textures"
        selectedOptions={textures}
        onUpdate={setTextures}
        options={["Wavy", "Curly", "Straight", "Coily"]}
      />
      <Checklist
        label="Hair Types"
        selectedOptions={types}
        onUpdate={setTypes}
        options={["Thin", "Medium", "Thick"]}
      />
      <Checklist
        label="Ingredients"
        selectedOptions={ingredients}
        onUpdate={setIngredients}
        options={[
          "Cruelty-Free",
          "Paraben-free",
          "Silicone Free",
          "Sulfate-free",
          "Vegan",
        ]}
      />
      <Checklist
        label="Concerns"
        selectedOptions={concerns}
        onUpdate={setConcerns}
        options={["Frizz", "Shine", "Dryness", "Heat Protection", "Color Safe"]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 16,
    gap: 16,
  },
});

import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Button, StyleSheet, Text, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import ShutterButton from "@/components/ShutterButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import ProductSkeleton from "@/components/ProductSkeleton";
import { router } from "expo-router";
import ProductSkeletonSmall from "@/components/ProductSkeletonSmall";
import OrDivider from "@/components/OrDivider";
import { Product } from "@/types/Product";
import ProductTile from "@/components/ProductTile";
import ProductTileSmall from "@/components/ProductTileSmall";
import SadCat from "@/components/SadCat";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [products, setProducts] = useState<Product[] | undefined>(undefined);
  const cameraViewRef = useRef<CameraView>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    setProducts(undefined);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    bottomSheetModalRef.current?.present();

    const picture = await cameraViewRef?.current?.takePictureAsync({
      base64: true,
      quality: 0.25,
    });

    const response = await fetch(
      "https://blasterhacks.lenixsavesthe.world/groq-ocr",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: picture?.base64 }),
      }
    );

    if (response.status !== 200) {
      setProducts([]);
      return;
    }

    const ps: Product[] = await response.json();
    console.log(ps);

    // let savedProducts: Product[]
    const savedProds: string = (await AsyncStorage.getItem("product-history")) || "";
    const parsedProds: Product[] = JSON.parse(savedProds) as Product[]

    parsedProds.push(ps[0])
    console.log("prods after push", parsedProds)

    const pJson = JSON.stringify(parsedProds)
    await AsyncStorage.setItem('product-history', pJson); 
    console.log("saved product history locally")

    setProducts(ps || []);
  };

  // Adjust snapPoints: when no products are found, raise the bottom sheet higher (e.g. 400)
  const snapPoints =
    !products
      ? [350]
      : products.length === 0
      ? [300]
      : products.length === 1
      ? [350]
      : [350, "80%"];

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <CameraView
          style={styles.camera}
          ref={cameraViewRef}
          animateShutter={false}
        >
          <ShutterButton onPress={takePicture} />
        </CameraView>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
          enableHandlePanningGesture={true}
          enableContentPanningGesture={false}
        >
          {products ? (
            products.length > 0 ? (
              <BottomSheetScrollView
                contentContainerStyle={styles.modalContentContainer}
              >
                <View style={styles.spacedContainer}>
                  <ProductTile product={products[0]} />
                  {products.length > 1 && (
                    <View style={styles.spacedContainer}>
                      <OrDivider />
                      {products.slice(1).map((product) => (
                        <Pressable
                          key={product.product_id}
                          onPress={() =>
                            router.push(`/products/${product.product_id}`)
                          }
                        >
                          <ProductTileSmall product={product} />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </BottomSheetScrollView>
            ) : (
              // No products found: fixed, non-scrollable view
              <View style={styles.notFoundContainer}>
                <SadCat />
                <Pressable
                  style={styles.noMatchButton}
                  onPress={() => router.push("/manualfill")}
                >
                  <Text style={styles.noMatchButtonText}>No Match</Text>
                </Pressable>
              </View>
            )
          ) : (
            // Loading state
            <BottomSheetScrollView
              contentContainerStyle={styles.modalContentContainer}
            >
              <View style={styles.loadingContainer}>
                <ProductSkeleton />
              </View>
            </BottomSheetScrollView>
          )}
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 24,
  },
  loadingContainer: {
    gap: 16,
  },
  spacedContainer: {
    gap: 16,
  },
  // Fixed container for no-results state
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noMatchButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 1,
    width: "100%",
  },
  noMatchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

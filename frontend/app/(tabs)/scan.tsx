import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View, Image, Pressable } from "react-native";
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

    if (response.status != 200) {
      setProducts([]);
      return;
    }

    const ps: Product[] = await response.json();
    console.log(ps);
    setProducts(ps || []);
  };

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
          snapPoints={
            !products // No query
              ? [350]
              : products.length == 0 // No product found
              ? [150]
              : products.length == 1
              ? [350]
              : [350, "80%"]
          }
          enableDynamicSizing={false}
          enablePanDownToClose={true}
          enableHandlePanningGesture={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.modalContentContainer}
          >
            {products ? (
              products.length ? (
                <View style={styles.spacedContainer}>
                  <ProductTile product={products[0]} />
                  {products.length > 1 && (
                    <View style={styles.spacedContainer}>
                      <OrDivider />
                      {products.slice(1).map((product) => (
                        <ProductTileSmall
                          product={product}
                          key={product.product_id}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <SadCat />
              )
            ) : (
              <View style={styles.loadingContainer}>
                <ProductSkeleton />
              </View>
            )}

            {products && (
              <Pressable
                style={styles.noMatchButton}
                onPress={() => router.push("/manualfill")}
              >
                <Text style={styles.noMatchButtonText}>No Match</Text>
              </Pressable>
            )}
          </BottomSheetScrollView>
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
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 16,
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
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  correctButton: {
    backgroundColor: "#4CAF50", // Green color
  },
  incorrectButton: {
    backgroundColor: "#F44336", // Red color
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    gap: 16,
  },
  spacedContainer: {
    gap: 16,
  },
  noMatchButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  noMatchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

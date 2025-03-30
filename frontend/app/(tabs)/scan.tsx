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
import ProductSkeleton from "@/components/ProductSkeletonSmall";
import { router } from "expo-router";

type Product = {
  brand_name: string;
  product_name: string;
  product_type: string;
};

function MatchedProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: "https://via.placeholder.com/300x200" }}
        style={styles.productImage}
      />
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.productBrand}>{product.brand_name}</Text>
        </View>
        <Text style={styles.rating}>⭐ 4.5</Text>
      </View>
      <Text style={styles.hairTexture}>Category: {product.product_type}</Text>
    </View>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState<Product | undefined>(undefined);
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
    setProduct(undefined);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Present the bottom sheet modal at 60%
    bottomSheetModalRef.current?.present();

    const picture = await cameraViewRef?.current?.takePictureAsync({
      base64: true,
      quality: 0.25,
    });

    const product: Product = await (
      await fetch("https://blasterhacks.lenixsavesthe.world/groq-ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: picture?.base64 }),
      })
    ).json();

    setProduct(product);
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
          snapPoints={["60%"]}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
          enableHandlePanningGesture={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.modalContentContainer}
          >
            {product ? (
              <>
                <MatchedProductCard product={product} />
                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.button, styles.correctButton]}
                    onPress={() => {
                      router.replace("/");
                    }}
                  >
                    <Text style={styles.buttonText}>Correct Product</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.incorrectButton]}
                    onPress={() => {
                      router.replace("/manualfill");
                    }}
                  >
                    <Text style={styles.buttonText}>Incorrect</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <ProductSkeleton />
              </View>
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
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
});

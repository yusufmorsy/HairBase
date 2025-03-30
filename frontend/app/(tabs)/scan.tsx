import { CameraView, useCameraPermissions } from "expo-camera";
import { useContext, useRef, useState } from "react";
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
import { ImageContext } from "@/providers/ImageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryContext } from "@/providers/HistoryContext";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [products, setProducts] = useState<Product[] | undefined>(undefined);
  const cameraViewRef = useRef<CameraView>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { historyProducts, setHistoryProducts } = useContext(HistoryContext);

  const { image, setImage } = useContext(ImageContext);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.centeredContainer}>
          <Text style={styles.message}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
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

    const encodedImage = picture?.base64;
    setImage(encodedImage);

    const response = await fetch(
      "https://blasterhacks.lenixsavesthe.world/groq-ocr",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: encodedImage }),
      }
    );

    if (response.status !== 200) {
      setProducts([]);
      return;
    }

    const ps: Product[] = await response.json();
    setProducts(ps || []);
    console.log(ps);

    if (ps && ps.length > 0) {
      setHistoryProducts([...historyProducts, ps[0]]);
    }
  };

  // Adjust snapPoints based on products count
  const snapPoints = !products
    ? [350]
    : products.length === 0
    ? [300]
    : products.length === 1
    ? [350]
    : [350, "80%"];

  return (
    <GestureHandlerRootView style={styles.outerContainer}>
      <View style={styles.outerContainer}>
        {/* Background container with light blue color */}
        <BottomSheetModalProvider>
          {/* Wrap CameraView in a container that has the background color */}
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              ref={cameraViewRef}
              animateShutter={false}
            >
              <ShutterButton onPress={takePicture} />
            </CameraView>
          </View>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            enableHandlePanningGesture={true}
            enableContentPanningGesture={false}
          >
            {products ? (
              <BottomSheetScrollView
                contentContainerStyle={styles.modalContentContainer}
              >
                {products.length > 0 ? (
                  <View style={styles.spacedContainer}>
                    <ProductTile product={products[0]} />
                    {products.length > 1 && (
                      <View style={styles.spacedContainer}>
                        <OrDivider />
                        {products.slice(1).map((product) => (
                          <ProductTileSmall
                            key={product.product_name}
                            product={product}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.notFoundContainer}>
                    <SadCat />
                    <Text style={styles.message}>No products found.</Text>
                  </View>
                )}
                {/* "No Match" button always shown at the bottom */}
                <Pressable
                  style={styles.noMatchButton}
                  onPress={() => router.push("../form")}
                >
                  <Text style={styles.noMatchButtonText}>No Match</Text>
                </Pressable>
              </BottomSheetScrollView>
            ) : (
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
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#ADD8E6", // light blue background for the whole page
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    // Optionally, if CameraView’s default background is opaque,
    // you can try making it transparent:
    backgroundColor: "transparent",
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
  notFoundContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noMatchButton: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  noMatchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import ShutterButton from "@/components/ShutterButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

type Product = {
  brand_name: string;
  product_name: string;
  product_type: string;
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const cameraViewRef = useRef<CameraView>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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
    bottomSheetModalRef.current?.present();
    const picture = await cameraViewRef?.current?.takePictureAsync({
      base64: true,
      quality: 0.5,
    });
    const product: Product = await (
      await fetch("https://blasterhacks.lenixsavesthe.world/groq-ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: picture?.base64,
        }),
      })
    ).json();
    setProduct(product);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        {/* Camera View */}
        <CameraView
          style={styles.camera}
          ref={cameraViewRef}
          animateShutter={false}
        >
          <ShutterButton onPress={takePicture} />
        </CameraView>

        {/* Bottom Sheet */}
        <BottomSheetModal ref={bottomSheetModalRef}>
          <BottomSheetView style={styles.modalContentContainer}>
            {product ? (
              <View>
                <Text>{product.product_name}</Text>
                <Text>{product.brand_name}</Text>
              </View>
            ) : (
              <ActivityIndicator size={32} />
            )}
          </BottomSheetView>
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
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  modalContentContainer: {
    flex: 1,
    padding: 24,
    // alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});

import { StyleSheet, Text, View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function ProductSkeleton() {
  const opacityValue = useSharedValue(1);

  opacityValue.value = withRepeat(
    withTiming(0.3, {
      duration: 600,
      easing: Easing.inOut(Easing.quad),
      reduceMotion: ReduceMotion.System,
    }),
    -1,
    true
  );

  const pulsingStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.picturePlaceholder, pulsingStyle]} />
      <View style={styles.textContainer}>
        <Animated.View style={[styles.nameTextBar, pulsingStyle]} />
        <Animated.View style={[styles.nameTextBar, pulsingStyle]} />
        <Animated.View style={[styles.brandTextBar, pulsingStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    gap: 16,
  },
  picturePlaceholder: {
    height: 200,
    backgroundColor: "#c1c1c1",
    borderRadius: 8,
  },
  textContainer: {
    alignItems: "flex-start",
    gap: 8,
  },
  nameTextBar: {
    backgroundColor: "#c1c1c1",
    borderRadius: 4,
    width: "100%",
    height: 18,
  },
  brandTextBar: {
    backgroundColor: "#c1c1c1",
    borderRadius: 4,
    width: "50%",
    height: 18,
  },
});

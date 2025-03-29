import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { View, Pressable, StyleSheet, Text } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, { ReduceMotion, withTiming } from "react-native-reanimated";
import {
  useAnimatedStyle,
  useSharedValue,
  Easing,
} from "react-native-reanimated";

export default function OnboardingPage() {
  const progress = useSharedValue(0);
  const maxProgress = 4;

  const onComplete = async () => {
    await AsyncStorage.setItem("onboarding-complete", "true");
    router.replace("/");
  };

  const animatedWidth = useAnimatedStyle(() => {
    return {
      width: withTiming(`${((progress.value + 1) / maxProgress) * 100}%`, {
        duration: 50,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
    };
  });

  return (
    <View style={styles.container}>
      <PagerView
        initialPage={0}
        style={styles.pagerView}
        onPageScroll={(event) => {
          const { position, offset } = event.nativeEvent;
          progress.value = position + offset;
        }}
      >
        <View style={styles.page} key="1">
          <Text>Page 1</Text>
        </View>
        <View style={styles.page} key="2">
          <Text>Page 2</Text>
        </View>
        <View style={styles.page} key="3">
          <Text>Page 3</Text>
        </View>
        <View style={styles.page} key="4">
          <Pressable onPress={onComplete}>
            <Text>Complete onboarding</Text>
          </Pressable>
        </View>
      </PagerView>
      <View style={styles.barContainer}>
        <Animated.View style={[animatedWidth, styles.filledBar]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    inset: 0,
    padding: 16,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    backgroundColor: "#c1c1c1",
    height: 4,
    borderRadius: 2,
    alignItems: "flex-start",
  },
  filledBar: {
    backgroundColor: "#000",
    height: 4,
    borderRadius: 2,
  },
});

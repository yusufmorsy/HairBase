import Button from "@/components/Button";
import Hero from "@/components/Hero";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef } from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, { ReduceMotion, withTiming } from "react-native-reanimated";
import {
  useAnimatedStyle,
  useSharedValue,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// A simple multiple-choice component (single selection)
const MultipleChoice = ({
  question,
  options,
  selectedValue,
  onSelect,
}: {
  question: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question}</Text>
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.optionButton,
            selectedValue === option && styles.selectedOption,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
};

// A simple checklist component (multiple selections allowed)
const Checklist = ({
  question,
  options,
  selectedValues,
  onToggle,
}: {
  question: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question}</Text>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option);
        return (
          <Pressable
            key={index}
            style={[styles.optionButton, isSelected && styles.selectedOption]}
            onPress={() => onToggle(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function OnboardingPage() {
  const progress = useSharedValue(0);
  const maxProgress = 5;

  // Declare state variables with type annotations
  const [hairTexture, setHairTexture] = React.useState<string | null>(null);
  const [hairType, setHairType] = React.useState<string | null>(null);
  const [ingredientPrefs, setIngredientPrefs] = React.useState<string[]>([]);
  const [concerns, setConcerns] = React.useState<string[]>([]);

  const pagerViewRef = useRef<PagerView>(null);

  const onComplete = async () => {
    // Optionally, save user selections to AsyncStorage or send to your backend
    const onboardingData = {
      hairTexture,
      hairType,
      ingredientPrefs,
      concerns,
    };
    await AsyncStorage.setItem("onboarding-complete", "true");
    await AsyncStorage.setItem(
      "onboarding-data",
      JSON.stringify(onboardingData)
    );
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

  // Toggle functions for checklists
  const toggleIngredientPref = (option: string) => {
    setIngredientPrefs((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const toggleConcern = (option: string) => {
    setConcerns((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const advancePager = () => {
    pagerViewRef?.current?.setPage(Math.round(progress.value) + 1);
  };

  const boop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <PagerView
        initialPage={0}
        ref={pagerViewRef}
        style={styles.pagerView}
        onPageScroll={(event) => {
          const { position, offset } = event.nativeEvent;
          progress.value = position + offset;
        }}
      >
        {/* Welcome Page */}
        <View style={styles.page} key="1">
          <Hero imageSource={require("@/assets/images/phone-hand.svg")} />
        </View>

        {/* Page 1: Hair Texture */}
        <View style={styles.page} key="2">
          <Hero imageSource={require("@/assets/images/curly-hair.svg")} />
          <MultipleChoice
            question="What is your hair texture?"
            options={["Curly", "Wavy", "Straight", "Coily"]}
            selectedValue={hairTexture}
            onSelect={(hairTexture) => {
              boop();
              setHairTexture(hairTexture);
              advancePager();
            }}
          />
        </View>

        {/* Page 2: Hair Type */}
        <View style={styles.page} key="3">
          <Hero imageSource={require("@/assets/images/haircut.svg")} />
          <MultipleChoice
            question="What is your hair type?"
            options={["Fine", "Medium", "Thick"]}
            selectedValue={hairType}
            onSelect={(hairType) => {
              boop();
              setHairType(hairType);
              advancePager();
            }}
          />
        </View>

        {/* Page 3: Ingredient Preferences */}
        <View style={styles.page} key="4">
          <Hero imageSource={require("@/assets/images/hair-spray.svg")} />
          <Checklist
            question="What are your ingredient preferences?"
            options={[
              "Cruelty-Free",
              "Paraben-Free",
              "Silicone Free",
              "Sulfate Free",
              "Vegan",
            ]}
            selectedValues={ingredientPrefs}
            onToggle={toggleIngredientPref}
          />
          <Button
            text="Continue"
            icon={({ size, color }) => (
              <Feather size={size} color={color} name="arrow-right" />
            )}
            onPress={() => {
              boop();
              advancePager();
            }}
          />
        </View>

        {/* Page 4: Hair Concerns */}
        <View style={styles.page} key="5">
          <Hero imageSource={require("@/assets/images/curly-hair.svg")} />
          <Checklist
            question="What concerns do you have?"
            options={[
              "Dryness",
              "Frizz",
              "Shine",
              "UV Protection",
              "Color-Safe",
              "Heat Protection",
            ]}
            selectedValues={concerns}
            onToggle={toggleConcern}
          />
          <Pressable style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Complete Onboarding</Text>
          </Pressable>
        </View>
      </PagerView>
      <SafeAreaView edges={["left", "bottom", "right"]}>
        <View style={styles.barContainer}>
          <Animated.View style={[animatedWidth, styles.filledBar]} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#fff",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  questionContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 10,
  },
  selectedOption: {
    borderColor: "#000",
    backgroundColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
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
  completeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#000",
    borderRadius: 5,
  },
  completeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});

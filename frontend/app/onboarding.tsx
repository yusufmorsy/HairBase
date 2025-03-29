import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, { ReduceMotion, withTiming } from "react-native-reanimated";
import { useAnimatedStyle, useSharedValue, Easing } from "react-native-reanimated";

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
  const maxProgress = 4;

  // Declare state variables with type annotations
  const [hairTexture, setHairTexture] = React.useState<string | null>(null);
  const [hairType, setHairType] = React.useState<string | null>(null);
  const [ingredientPrefs, setIngredientPrefs] = React.useState<string[]>([]);
  const [concerns, setConcerns] = React.useState<string[]>([]);

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
        {/* Page 1: Hair Texture */}
        <View style={styles.page} key="1">
          <MultipleChoice
            question="What is your hair texture?"
            options={["curly", "wavy", "straight", "coily"]}
            selectedValue={hairTexture}
            onSelect={setHairTexture}
          />
        </View>

        {/* Page 2: Hair Type */}
        <View style={styles.page} key="2">
          <MultipleChoice
            question="What is your hair type?"
            options={["fine", "medium", "thick"]}
            selectedValue={hairType}
            onSelect={setHairType}
          />
        </View>

        {/* Page 3: Ingredient Preferences */}
        <View style={styles.page} key="3">
          <Checklist
            question="What are your ingredient preferences?"
            options={[
              "cruelty-free",
              "paraben-free",
              "silicone free",
              "sulfate free",
              "vegan",
            ]}
            selectedValues={ingredientPrefs}
            onToggle={toggleIngredientPref}
          />
        </View>

        {/* Page 4: Hair Concerns */}
        <View style={styles.page} key="4">
          <Checklist
            question="What concerns do you have?"
            options={[
              "dryness",
              "frizz",
              "shine",
              "uv protection",
              "color-safe",
              "heat protection",
            ]}
            selectedValues={concerns}
            onToggle={toggleConcern}
          />
          <Pressable style={styles.completeButton} onPress={onComplete}>
            <Text style={styles.completeButtonText}>Complete Onboarding</Text>
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

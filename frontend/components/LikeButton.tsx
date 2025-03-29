import AntDesign from "@expo/vector-icons/AntDesign";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useState } from "react";

type Props = {
  onChangeLiked?: (liked: boolean) => void;
  count: number;
};

export default function LikeButton({ onChangeLiked, count }: Props) {
  const [liked, setLiked] = useState<boolean>(false);

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
    if (onChangeLiked) {
      onChangeLiked(!liked);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onPress}>
        <AntDesign
          name={liked ? "heart" : "hearto"}
          size={32}
          color={liked ? "#f00" : "#858585"}
        />
      </Pressable>
      <Text style={styles.likeCount}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  likeCount: {
    color: "#858585",
    borderColor: "#000",
    textAlign: "center",
  },
  container: {
    gap: 4,
    justifyContent: "center",
    alignContent: "center",
  },
});

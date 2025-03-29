import Feather from "@expo/vector-icons/Feather";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";

export default function ScannerLink() {
  return (
    <Link
      href="/scan"
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Feather name="camera" size={18} color="#000" />
    </Link>
  );
}

import Feather from "@expo/vector-icons/Feather";
import { Link } from "expo-router";

export default function ScannerLink() {
  return (
    <Link href="/scan">
      <Feather name="camera" size={18} color="#000" />
    </Link>
  );
}

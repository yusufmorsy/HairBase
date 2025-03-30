import { Text } from "react-native";

type Props = {
  product_id: number;
};

export default function ShowProduct({ product_id }: Props) {
  return <Text>This is the view for product id {product_id}</Text>;
}

import { Product } from "@/types/Product";
import { createContext } from "react";

type HistoryContextType = {
  historyProducts: Product[];
  setHistoryProducts: (value: Product[]) => void;
};

export const HistoryContext = createContext<HistoryContextType>({
  historyProducts: [],
  setHistoryProducts: () => null,
});

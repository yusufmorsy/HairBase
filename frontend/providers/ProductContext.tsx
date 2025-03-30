import { Product } from "@/types/Product";
import { createContext } from "react";

export const ProductContext = createContext<Product | undefined>(undefined);

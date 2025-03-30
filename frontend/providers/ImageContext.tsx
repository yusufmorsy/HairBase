import { createContext } from "react";

type ImageContextType = {
  image: string | undefined;
  setImage: (value: string | undefined) => void;
};

export const ImageContext = createContext<ImageContextType>({
  image: undefined,
  setImage: () => null,
});

export type Product = {
  product_id: number;
  product_name: string;
  brand_name: string;
  image_url?: string;
  concerns?: string[];
  ingredients?: string[];
  textures?: string[];
  types?: string[];
}

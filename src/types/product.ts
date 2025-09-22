export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  // Slug of the category this product belongs to, e.g. "ipad-accessories"
  categorySlug?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  originalPrice: number;
  discountPrice?: number;
  isRecentlyAdded: boolean;
  isFeatured: boolean;
  isActive: boolean;
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  sortOrder: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  images?: {
    id: number;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

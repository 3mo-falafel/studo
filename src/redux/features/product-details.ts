import { createSlice } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState = {
  value: {
    id: 0,
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    originalPrice: 0,
    discountPrice: 0,
    isRecentlyAdded: false,
    isFeatured: false,
    isActive: true,
    stockQuantity: 0,
    sku: "",
    weight: 0,
    dimensions: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    sortOrder: 0,
    categoryId: 0,
    category: {
      id: 0,
      name: "",
      slug: ""
    },
    images: [],
    createdAt: "",
    updatedAt: ""
  },
} as InitialState;

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;

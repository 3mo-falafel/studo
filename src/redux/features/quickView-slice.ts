import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  } as Product,
} as InitialState;

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;

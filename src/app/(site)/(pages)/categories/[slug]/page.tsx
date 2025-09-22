"use client";
import React, { useState } from "react";
import SingleGridItem from "@/components/Shop/SingleGridItem";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";

const humanize = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug || "").toString();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);

  // For now, we'll fetch all products and filter by category slug
  // In a real app, you'd want to pass the category ID to the API
  const { products: allProducts, loading, error } = useProducts();
  
  const products = allProducts.filter((p) => {
    const [min, max] = priceRange;
    const inCategory = p.category?.slug === slug;
    const price = p.discountPrice ?? p.originalPrice;
    return inCategory && price >= min && price <= max;
  });

  if (loading) {
    return (
      <section className="pt-36 pb-20">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-36 pb-20">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading products: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-36 pb-20">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div className="mb-6 text-sm text-dark-4">
          <Link href="/">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-dark">{humanize(slug)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white shadow-1 rounded-lg p-6">
              <p className="text-dark mb-3">Price</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value) || 0, priceRange[1]])
                  }
                  className="w-24 border rounded px-2 py-1"
                />
                <span>-</span>
                <input
                  type="number"
                  min={0}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value) || 0])
                  }
                  className="w-24 border rounded px-2 py-1"
                />
              </div>
            </div>
          </aside>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-dark">
                {humanize(slug)}
              </h1>
              <p className="text-dark-4 text-sm">{products.length} products</p>
            </div>

            {products.length === 0 ? (
              <p className="text-dark-4">No products found in this category.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <SingleGridItem key={product.id} item={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

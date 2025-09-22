"use client";
import { useState, useEffect } from 'react';
import { Product } from '@/types/product';

interface UseProductsOptions {
  categoryId?: number;
  featured?: boolean;
  recentlyAdded?: boolean;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (options.categoryId) params.append('categoryId', options.categoryId.toString());
        if (options.featured) params.append('featured', 'true');
        if (options.recentlyAdded) params.append('recentlyAdded', 'true');
        if (options.limit) params.append('limit', options.limit.toString());
        
        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [options.categoryId, options.featured, options.recentlyAdded, options.limit]);

  return { products, loading, error };
}

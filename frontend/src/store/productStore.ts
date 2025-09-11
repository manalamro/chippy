import { create } from 'zustand';
import { getProducts, getProductBySlug, getCategories } from '../lib/apiClient';
import type { Product } from '../types/product';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  image_url?: string;
}

interface ProductState {
  products: Product[];
  selectedProduct?: Product;
  categories: Category[];
  loading: boolean;
  error?: string;

  fetchProducts: (categorySlug?: string, search?: string) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearSelectedProduct: () => void; // ✅ إضافة دالة لمسح المنتج المحدد

}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: undefined,
  categories: [],
  loading: false,
  error: undefined,

  fetchProducts: async (categorySlug?: string, search?: string) => {
    set({ loading: true, error: undefined });
    try {
      const params: any = {};
      if (categorySlug && categorySlug !== 'all') params.category = categorySlug;
      if (search) params.search = search;

      const products = await getProducts(params);
      set({ products, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch products', loading: false });
    }
  },
  
  fetchProductBySlug: async (slug: string) => {
    console.log('🏪 Store: Starting fetchProductBySlug for:', slug);
    set({ loading: true, error: undefined });
    try {
      const product = await getProductBySlug(slug);
      console.log('🏪 Store: Product fetched successfully:', product);
      set({ selectedProduct: product, loading: false });
    } catch (err: any) {
      console.error('🏪 Store: Error in fetchProductBySlug:', err);
      set({ error: err.message || 'Failed to fetch product', loading: false });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: undefined });
    try {
      const categories = await getCategories();
      set({ categories: [{ id: 0, name: 'ALL', slug: 'all' }, ...categories], loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch categories', loading: false });
    }
  },
  clearSelectedProduct: () => {
    set({ selectedProduct: undefined }); // ✅ مسح المنتج المحدد عند الخروج من الصفحة
  },

}));

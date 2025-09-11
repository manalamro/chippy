import { create } from 'zustand';
import { 
  getProducts, 
  getProductBySlug, 
  getCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from '../lib/apiClient';
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
  clearSelectedProduct: () => void;
  
  // Admin functions
  createProduct: (productData: any) => Promise<void>;
  updateProduct: (id: number, productData: any) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  createCategory: (categoryData: any) => Promise<void>;
  updateCategory: (id: number, categoryData: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
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
    set({ loading: true, error: undefined });
    try {
      const product = await getProductBySlug(slug);
      set({ selectedProduct: product, loading: false });
    } catch (err: any) {
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
    set({ selectedProduct: undefined });
  },

  // Admin product functions
  createProduct: async (productData: any) => {
    set({ loading: true, error: undefined });
    try {
      await adminCreateProduct(productData);
      // Refresh products after creation
      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message || 'Failed to create product', loading: false });
      throw err;
    }
  },

  updateProduct: async (id: number, productData: any) => {
    set({ loading: true, error: undefined });
    try {
      await adminUpdateProduct(id, productData);
      // Refresh products after update
      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message || 'Failed to update product', loading: false });
      throw err;
    }
  },

  deleteProduct: async (id: number) => {
    set({ loading: true, error: undefined });
    try {
      await adminDeleteProduct(id);
      // Refresh products after deletion
      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete product', loading: false });
      throw err;
    }
  },

  // Admin category functions
  createCategory: async (categoryData: any) => {
    set({ loading: true, error: undefined });
    try {
      await adminCreateCategory(categoryData);
      // Refresh categories after creation
      await get().fetchCategories();
    } catch (err: any) {
      set({ error: err.message || 'Failed to create category', loading: false });
      throw err;
    }
  },

  updateCategory: async (id: number, categoryData: any) => {
    set({ loading: true, error: undefined });
    try {
      await adminUpdateCategory(id, categoryData);
      // Refresh categories after update
      await get().fetchCategories();
    } catch (err: any) {
      set({ error: err.message || 'Failed to update category', loading: false });
      throw err;
    }
  },

  deleteCategory: async (id: number) => {
    set({ loading: true, error: undefined });
    try {
      await adminDeleteCategory(id);
      // Refresh categories after deletion
      await get().fetchCategories();
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete category', loading: false });
      throw err;
    }
  }
}));
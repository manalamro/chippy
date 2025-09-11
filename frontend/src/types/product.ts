// types/product.ts
export interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    sku: string;
    stock: number;
    category_id: number;
    category_name?: string;
    created_at: string;
    images?: ProductImage[];
  }
  
  export interface ProductImage {
    id: number;
    product_id: number;
    url: string;
    alt: string;
  }
  
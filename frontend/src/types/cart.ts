// types/cart.ts
import type { Product } from './product';

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

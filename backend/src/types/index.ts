export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'USER' | 'ADMIN';
    created_at: Date;
  }
  
  export interface Category {
    id: number;
    name: string;
    slug: string;
  }
  
  export interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    sku: string;
    stock: number;
    category_id: number;
    created_at: Date;
  }
  
  export interface ProductImage {
    id: number;
    product_id: number;
    url: string;
    alt: string;
  }
  
  export interface Address {
    id: number;
    user_id: number;
    full_name: string;
    phone: string;
    city: string;
    street: string;
    notes?: string;
    is_default: boolean;
  }
  
  export interface Cart {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
  }
  
  export interface Order {
    id: number;
    user_id: number;
    address_id: number;
    total: number;
    status: string;
    payment_status: string;
    created_at: Date;
  }
  
  export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
  }
  
  export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
  }
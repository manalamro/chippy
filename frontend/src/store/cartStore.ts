import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../lib/apiClient';

export interface Product {
  id: number;
  title: string;
  price: number;
  images?: Array<{ url: string; alt: string }>;
  category?: { name: string };
  slug?: string;
  stock?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price?: number;
  item_total?: number;
}

export interface Cart {
  id: string;
  userId?: string | null;
  items: CartItem[];
  total?: number;
}

export interface CartState {
  cart?: Cart;
  loading: boolean;
  error?: string;

  fetchCart: (userId?: string) => Promise<void>;
  addItemToCart: (productId: number, quantity: number, product: Product, cartId?: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  syncGuestCartToBackend: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: undefined,
      loading: false,
      error: undefined,

      fetchCart: async (userId?: string) => {
        set({ loading: true, error: undefined });

        try {
          if (userId) {
            // User is authenticated - fetch cart from backend
            const backendCart = await api.getCart();
            
            // Get any guest cart items to sync
            const currentCart = get().cart;
            const hasGuestItems = currentCart && currentCart.userId === null && currentCart.items.length > 0;
            
            if (hasGuestItems) {
              // Sync guest items to backend first
              await get().syncGuestCartToBackend();
              // Fetch updated cart after sync
              const updatedCart = await api.getCart();
              
              const cartData: Cart = {
                id: `user-${userId}`,
                userId,
                items: mapBackendItemsToFrontend(updatedCart.items),
                total: updatedCart.total
              };
              
              set({ cart: cartData, loading: false });
            } else {
              // No guest items, use backend cart directly
              const cartData: Cart = {
                id: `user-${userId}`,
                userId,
                items: mapBackendItemsToFrontend(backendCart.items),
                total: backendCart.total
              };
              
              set({ cart: cartData, loading: false });
            }
            
            // Clean up guest cart data
            localStorage.removeItem('guest_cart_id');
          } else {
            // Guest user - use local storage
            const guestCartId = localStorage.getItem('guest_cart_id');
            if (guestCartId && get().cart?.id === guestCartId) {
              // Keep existing guest cart
              set({ loading: false });
            } else {
              // Create new guest cart
              const cartData: Cart = { 
                id: `guest-${Date.now()}`, 
                userId: null, 
                items: [] 
              };
              localStorage.setItem('guest_cart_id', cartData.id);
              set({ cart: cartData, loading: false });
            }
          }
        } catch (error: any) {
          console.error('Error fetching cart:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to fetch cart',
            loading: false 
          });
        }
      },

      addItemToCart: async (productId: number, quantity: number, product: Product, cartId?: string) => {
        if (!product) throw new Error("Product data must be provided");

        console.log('🛒 Adding item to cart:', { productId, quantity, product: product.title });
        set({ loading: true, error: undefined });

        try {
          const currentCart = get().cart;
          const token = localStorage.getItem('token');
          const isAuthenticated = currentCart?.userId || token;
          
          console.log('🔐 Is authenticated?', !!isAuthenticated);
          console.log('🔐 Current cart userId:', currentCart?.userId);
          console.log('🔐 Token exists:', !!token);
          
          if (isAuthenticated && token) {
            console.log('📡 Making API call to add item...');
            // User is authenticated - add to backend
            await api.addToCart(productId, quantity);
            console.log('✅ Item added to backend cart');
            
            // Refresh cart from backend
            console.log('🔄 Refreshing cart from backend...');
            const updatedBackendCart = await api.getCart();
            console.log('📦 Updated backend cart:', updatedBackendCart);
            
            const cartData: Cart = {
              id: currentCart?.id || `user-authenticated`,
              userId: currentCart?.userId || 'authenticated',
              items: mapBackendItemsToFrontend(updatedBackendCart.items),
              total: updatedBackendCart.total
            };
            
            set({ cart: cartData, loading: false });
          } else {
            console.log('👤 Guest user - adding to local cart');
            // Guest user - add to local cart
            const guestCart = currentCart || { 
              id: cartId || `guest-${Date.now()}`, 
              userId: null, 
              items: [] 
            };
            
            const existingIndex = guestCart.items.findIndex(item => item.product.id === productId);

            let updatedItems: CartItem[];
            if (existingIndex >= 0) {
              updatedItems = guestCart.items.map((item, idx) =>
                idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
              );
            } else {
              const newItem: CartItem = { 
                id: `cart-item-${productId}-${Date.now()}`, 
                product, 
                quantity,
                unit_price: product.price
              };
              updatedItems = [...guestCart.items, newItem];
            }

            const updatedCart = { ...guestCart, items: updatedItems };
            
            // Save guest cart ID if it's new
            if (!currentCart) {
              localStorage.setItem('guest_cart_id', updatedCart.id);
            }
            
            set({ cart: updatedCart, loading: false });
          }
        } catch (error: any) {
          console.error('❌ Error adding item to cart:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to add item to cart',
            loading: false 
          });
        }
      },

      updateCartItemQuantity: async (itemId: string, quantity: number) => {
        set({ loading: true, error: undefined });
        
        try {
          const currentCart = get().cart;
          if (!currentCart) {
            set({ loading: false });
            return;
          }

          if (currentCart.userId) {
            // User is authenticated - update in backend (backend handles stock validation)
            const numericItemId = extractNumericId(itemId);
            
            if (quantity <= 0) {
              await api.removeCartItem(numericItemId);
            } else {
              await api.updateCartItem(numericItemId, quantity);
            }
            
            // Refresh cart from backend
            const updatedBackendCart = await api.getCart();
            const cartData: Cart = {
              id: currentCart.id,
              userId: currentCart.userId,
              items: mapBackendItemsToFrontend(updatedBackendCart.items),
              total: updatedBackendCart.total
            };
            
            set({ cart: cartData, loading: false });
          } else {
            // Guest user - update local cart with stock validation
            const item = currentCart.items.find(item => item.id === itemId);
            
            if (item && quantity > 0 && item.product.stock !== undefined && quantity > item.product.stock) {
              throw new Error(`Only ${item.product.stock} items available in stock.`);
            }

            if (quantity <= 0) {
              const updatedItems = currentCart.items.filter(item => item.id !== itemId);
              set({ cart: { ...currentCart, items: updatedItems }, loading: false });
              return;
            }

            const updatedItems = currentCart.items.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            );
            set({ cart: { ...currentCart, items: updatedItems }, loading: false });
          }
        } catch (error: any) {
          console.error('Error updating cart item:', error);
          set({ 
            error: error.response?.data?.message || error.message || 'Failed to update cart item',
            loading: false 
          });
        }
      },

      removeItemFromCart: async (itemId: string) => {
        set({ loading: true, error: undefined });
        
        try {
          const currentCart = get().cart;
          if (!currentCart) {
            set({ loading: false });
            return;
          }

          if (currentCart.userId) {
            // User is authenticated - remove from backend
            const numericItemId = extractNumericId(itemId);
            await api.removeCartItem(numericItemId);
            
            // Refresh cart from backend
            const updatedBackendCart = await api.getCart();
            const cartData: Cart = {
              id: currentCart.id,
              userId: currentCart.userId,
              items: mapBackendItemsToFrontend(updatedBackendCart.items),
              total: updatedBackendCart.total
            };
            
            set({ cart: cartData, loading: false });
          } else {
            // Guest user - remove from local cart
            const updatedItems = currentCart.items.filter(item => item.id !== itemId);
            set({ cart: { ...currentCart, items: updatedItems }, loading: false });
          }
        } catch (error: any) {
          console.error('Error removing cart item:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to remove cart item',
            loading: false 
          });
        }
      },

      clearCart: () => {
        set({ cart: { id: `guest-${Date.now()}`, userId: null, items: [] } });
        localStorage.removeItem('guest_cart_id');
      },

      syncGuestCartToBackend: async () => {
        const currentCart = get().cart;
        if (!currentCart || currentCart.userId || currentCart.items.length === 0) {
          return;
        }

        try {
          // Add all guest items to backend cart
          for (const item of currentCart.items) {
            await api.addToCart(item.product.id, item.quantity);
          }
        } catch (error) {
          console.error('Error syncing guest cart:', error);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// Helper function to map backend cart items to frontend format
function mapBackendItemsToFrontend(backendItems: any[]): CartItem[] {
  return backendItems.map(item => ({
    id: `backend-${item.id}`, // Prefix to distinguish backend IDs
    product: {
      id: item.product_id,
      title: item.title,
      price: item.unit_price,
      slug: item.slug,
      stock: item.stock,
      images: item.image_url ? [{ url: item.image_url, alt: item.title }] : []
    },
    quantity: item.quantity,
    unit_price: item.unit_price,
    item_total: item.item_total
  }));
}

// Helper function to extract numeric ID from prefixed ID
function extractNumericId(itemId: string): number {
  if (itemId.startsWith('backend-')) {
    return parseInt(itemId.replace('backend-', ''));
  }
  // For backward compatibility, try to extract from cart-item format
  const match = itemId.match(/cart-item-(\d+)-/);
  if (match) {
    return parseInt(match[1]);
  }
  // Fallback - try to parse as number
  return parseInt(itemId);
}
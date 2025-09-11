import React, { useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, AlertCircle } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

interface CartProps {
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { cart, updateCartItemQuantity, removeItemFromCart, loading, error, fetchCart } = useCartStore();
  const items = cart?.items || [];
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useUserStore();

  // Calculate totals - use backend total if available, otherwise calculate frontend
  const subtotal = cart?.total || items.reduce((total, item) => {
    const price = item.unit_price || item.product.price;
    return total + (price * item.quantity);
  }, 0);
  
  const total = subtotal ;

  // Fetch cart on component mount
  useEffect(() => {
    if (user) {
      fetchCart(String(user.id));
    } else {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCheckout = () => {
    // Check for token in localStorage as backup if token from store is not available
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      // Redirect to auth if no token found
      navigate("/auth", { state: { redirectTo: "/checkout" } });
    } else {
      // User is authenticated, proceed to checkout
      alert(`Hello ${user?.name || 'User'}! Proceeding to checkout...`);
      onCheckout();
      navigate("/checkout");
    }
  };

  // Show loading state
  if (loading && !cart) {
    return (
      <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto"></div>
            <p className="mt-4 text-amber-900">{t("cart.loading") || "Loading cart..."}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">{t("cart.title")}</h1>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ShoppingBag className="mx-auto h-12 w-12 text-amber-400" />
            <h3 className="mt-2 text-lg font-medium text-amber-900">{t("cart.empty")}</h3>
            <p className="mt-1 text-amber-700">{t("cart.emptyMessage")}</p>
            <a href="/products" className="mt-4 inline-block px-4 py-2 bg-[#A97155] text-white rounded-md hover:bg-[#8f5e43] transition-colors">
              {t("cart.browseProducts")}
            </a>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <ul className="-my-6 divide-y divide-gray-200">
                  {items.map(item => {
                    const itemPrice = item.unit_price || item.product.price;
                    const itemTotal = itemPrice * item.quantity;
                    const isAtStockLimit = item.product.stock !== undefined && item.quantity >= item.product.stock;
                    const hasExceededStock = item.product.stock !== undefined && item.product.stock < item.quantity;
                    
                    return (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                          <img 
                            src={item.product.images?.[0]?.url || "/api/placeholder/96/96"} 
                            alt={item.product.title} 
                            className="w-full h-full object-center object-cover" 
                          />
                        </div>
                        <div className='flex-1 flex flex-col mr-3'>
                          <div className="flex justify-between text-base font-medium text-amber-950">
                            <h3>{item.product.title}</h3>
                            <p className='mr-4'>${itemTotal.toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-amber-900">{item.product.category?.name}</p>
                          
                          {/* Stock warnings and messages */}
                          {hasExceededStock && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              ⚠️ Only {item.product.stock} in stock - please reduce quantity
                            </p>
                          )}
                          
                          {isAtStockLimit && !hasExceededStock && (
                            <p className="mt-1 text-xs text-orange-600">
                              📦 Maximum stock limit reached ({item.product.stock} available)
                            </p>
                          )}
                          
                          {item.product.stock !== undefined && item.product.stock > 0 && !isAtStockLimit && !hasExceededStock && (
                            <p className="mt-1 text-xs text-gray-500">
                              {item.product.stock - item.quantity} more available
                            </p>
                          )}
                          
                          <div className="flex-1 flex items-end justify-between text-sm mt-2">
                            <div className="flex flex-col">
                              <div className="flex items-center border rounded-md border-gray-200">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                                  className="px-2 py-1 text-amber-950 disabled:opacity-50 hover:bg-gray-50" 
                                  disabled={item.quantity <= 1 || loading}
                                  title={item.quantity <= 1 ? "Cannot reduce below 1" : "Decrease quantity"}
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="px-2 py-1 text-amber-950 min-w-[2rem] text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} 
                                  className="px-2 py-1 text-amber-950 hover:text-amber-800 disabled:opacity-50 hover:bg-gray-50"
                                  disabled={loading || isAtStockLimit}
                                  title={
                                    isAtStockLimit 
                                      ? `Maximum stock limit reached (${item.product.stock} available)`
                                      : "Increase quantity"
                                  }
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              
                              {/* Additional message when plus button is disabled */}
                              {isAtStockLimit && (
                                <p className="mt-1 text-xs text-gray-500 text-center">
                                  Can't add more - max stock reached
                                </p>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item.id)} 
                              className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                              disabled={loading}
                              title="Remove item from cart"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
               
              
                <div className="flex justify-between text-lg font-bold text-amber-900 mt-3 pt-3 border-t border-gray-200">
                  <p>{t('cart.total')}</p>
                  <p>${total.toFixed(2)}</p>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={handleCheckout} 
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#A97155] hover:bg-[#8f5e43] transition-colors disabled:opacity-50"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('cart.updating') || 'Updating...'}
                      </>
                    ) : (
                      t('cart.checkout')
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <a href="/products" className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43] font-medium">
                <ArrowLeft size={16} className='mr-1 rotate-180' />
                {t('cart.continueShopping')}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
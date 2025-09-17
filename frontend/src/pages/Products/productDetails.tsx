import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { selectedProduct, fetchProductBySlug, loading, clearSelectedProduct } = useProductStore();
  const { addItemToCart, cart } = useCartStore();
  const { user } = useUserStore();
  
  const [error, setError] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      
      setLoadingProduct(true);
      setError(null);
      try {
        await fetchProductBySlug(slug);
      } catch (err: any) {
        console.error('Error loading product:', err);
        setError(t('error.generic'));
      } finally {
        setLoadingProduct(false);
      }
    };
    
    loadProduct();
    return () => clearSelectedProduct();
  }, [slug, fetchProductBySlug, clearSelectedProduct, t]);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    setAddingToCart(true);
    setError(null);
    
    try {
      // تحقق من الكمية الموجودة بالسلة
      const existingItem = cart?.items.find((item) => item.product.id === selectedProduct.id);
      const currentQty = existingItem ? existingItem.quantity : 0;

    // منع تجاوز المخزون
    if (selectedProduct.stock !== undefined && currentQty >= selectedProduct.stock) {
      toast.error(t('PRODUCTS.UI.STOCK_LIMIT_REACHED', 'لقد وصلت للحد الأقصى من هذا المنتج في السلة'));
      return;
    }

      const guestCartId = localStorage.getItem('guest_cart_id');
      const cartId = user?.id ? String(user.id) : guestCartId || undefined;

      const productForCart = {
        id: selectedProduct.id,
        title: selectedProduct.title,
        price: selectedProduct.price,
        images: selectedProduct.images,
        category: { name: selectedProduct.category_name || '' },
        stock: selectedProduct.stock,
      };

      await addItemToCart(selectedProduct.id, 1, productForCart, cartId);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (err: any) {
      console.error('Failed to add item to cart:', err);
      setError(t('error.generic') || 'حدث خطأ أثناء إضافة المنتج للسلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (slug) {
      fetchProductBySlug(slug);
    }
  };

  if (loadingProduct || loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#A97155] mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-[#A97155]/40 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-gray-600 text-xl">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-red-800">{t('error.generic')}</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('error.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">{t('PRODUCTS.UI.NO_PRODUCTS_FOUND') || 'Product not found'}</h3>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2">
        <img
          src={selectedProduct.images?.[0]?.url || 'https://via.placeholder.com/400'}
          alt={selectedProduct.images?.[0]?.alt || selectedProduct.title}
          className="w-full h-96 object-cover rounded-2xl"
        />
      </div>
      <div className="md:w-1/2 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4">{selectedProduct.title}</h1>
          <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
          <p className="text-xl font-bold mb-2">${selectedProduct.price}</p>
          <p className="text-gray-500 mb-4">
            {selectedProduct.stock} {t('PRODUCTS.UI.STOCK', 'in stock')}
          </p>
          <p className="text-gray-500 mb-4">
            {t('PRODUCTS.UI.CATEGORY', 'Category')}: {selectedProduct.category_name}
          </p>
          <p className="text-gray-500 mb-4">
            {t('PRODUCTS.UI.SKU', 'SKU')}: {selectedProduct.sku}
          </p>
        </div>
        {addedToCart ? (
          <div className="flex items-center justify-center px-6 py-3 rounded-lg bg-green-500 text-white font-medium">
            <CheckCircle className="w-5 h-5 mr-2" />
            {t('cart.added') || 'Added to Cart!'}
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            className="px-6 py-3 rounded-lg bg-[#D9A441] hover:bg-[#c19038] text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={selectedProduct.stock === 0 || addingToCart}
          >
            {addingToCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('cart.updating') || 'Adding...'}
              </>
            ) : selectedProduct.stock === 0 ? (
              t('PRODUCTS.UI.OUT_OF_STOCK', 'Out of Stock')
            ) : (
              t('PRODUCTS.UI.ADD_TO_CART', 'Add to Cart')
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

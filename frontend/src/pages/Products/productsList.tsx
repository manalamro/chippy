import React, { useEffect, useState } from 'react';
import { CheckCircle, Search, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

const ProductsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const { products, categories, fetchProducts, fetchCategories } = useProductStore();
  const { addItemToCart, fetchCart, cart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const userIdStr = user?.id ? String(user.id) : undefined;

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      setError(null);
      try {
        await fetchCategories();
      } catch (err: any) {
        console.error('Error loading categories:', err);
        setError(t('error.generic'));
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [fetchCategories, t]);

  // Set default category after categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    const loadProducts = async () => {
      // Only load products if we have a category selected
      if (!selectedCategory) return;
      
      setLoadingProducts(true);
      setError(null);
      try {
        // Pass empty string for category if 'all' is selected
        const categoryToFetch = selectedCategory === 'all' ? '' : selectedCategory;
        await fetchProducts(categoryToFetch, searchQuery);
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(t('error.generic'));
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [fetchProducts, selectedCategory, searchQuery, t]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart(userIdStr);
      } catch (err: any) {
        console.error('Error loading cart:', err);
        // لا نعرض خطأ للسلة لأنها ليست حرجة
      }
    };
    loadCart();
  }, [fetchCart, userIdStr]);

  const handleAddToCart = async (product: any) => {
    try {
      // تحقق من الكمية الموجودة بالسلة
      const existingItem = cart?.items.find((item) => item.product.id === product.id);
      const currentQty = existingItem ? existingItem.quantity : 0;

      // منع تجاوز المخزون
      if (product.stock !== undefined && currentQty >= product.stock) {
        alert(t('PRODUCTS.UI.STOCK_LIMIT_REACHED', 'لقد وصلت للحد الأقصى من هذا المنتج في السلة'));
        return;
      }

      const guestCartId = localStorage.getItem('guest_cart_id');
      const cartId = userIdStr || guestCartId || undefined;

      const productForCart = {
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        category: { name: product.category_name || '' },
        stock: product.stock, 
      };

      await addItemToCart(product.id, 1, productForCart, cartId);

      setAddedToCart(product.id);
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (err: any) {
      console.error('Failed to add item to cart:', err);
      alert(t('error.generic') || 'حدث خطأ أثناء إضافة المنتج للسلة');
    }
  };

  const handleNavigateToDetail = (slug: string) => {
    navigate(`/products/${slug}`);
  };

  const handleRetry = () => {
    setError(null);
    if (selectedCategory) {
      const categoryToFetch = selectedCategory === 'all' ? '' : selectedCategory;
      fetchProducts(categoryToFetch, searchQuery);
    }
    if (categories.length === 0) {
      fetchCategories();
    }
  };

  return (
    <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white/70" dir={i18n.dir()}>
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('error.retry')}
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-12 p-6 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('PRODUCTS.UI.SEARCH_PLACEHOLDER') || 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A97155] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="w-full md:w-1/3">
              {loadingCategories ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A97155]"></div>
                  <span className="ml-2 text-gray-500">{t('loading')}</span>
                </div>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A97155] focus:border-transparent"
                >
                  <option value="all">{t('PRODUCTS.UI.ALL_CATEGORIES') || 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#A97155] mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-[#A97155]/40 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-gray-600 text-lg">{t('loading')}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => handleNavigateToDetail(product.slug)}
                >
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                    alt={product.images?.[0]?.alt || product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {addedToCart === product.id && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
                      <div className="text-white text-center">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">تم إضافة المنتج للسلة!</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">${product.price}</span>
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[#D9A441] hover:bg-[#c19038] text-white transition-all duration-200"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0
                        ? t('PRODUCTS.UI.OUT_OF_STOCK', 'Out of Stock')
                        : t('PRODUCTS.UI.ADD_TO_CART') || 'إضافة للسلة'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('PRODUCTS.UI.NO_PRODUCTS_FOUND') || 'No products found'}</h3>
            <p className="text-gray-600 mb-6">{t('PRODUCTS.UI.NO_PRODUCTS_DESCRIPTION') || 'Try changing the search or filter'}</p>
            {(searchQuery || (selectedCategory && selectedCategory !== 'all')) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center px-4 py-2 bg-[#A97155] hover:bg-[#8f5e43] text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                {t('PRODUCTS.UI.CLEAR_FILTERS') || 'Clear Filters'}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsList;

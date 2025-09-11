import React, { useEffect, useState } from 'react';
import { CheckCircle, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

const ProductsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  const { products, categories, fetchProducts, fetchCategories, loading } = useProductStore();
  const { addItemToCart, fetchCart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const userIdStr = user?.id ? String(user.id) : undefined;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [fetchProducts, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCart(userIdStr);
  }, [fetchCart, userIdStr]);

  const handleAddToCart = async (product: any) => {
    try {
      const guestCartId = localStorage.getItem('guest_cart_id');
      const cartId = userIdStr || guestCartId || undefined;

      const productForCart = {
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        category: { name: product.category_name || '' },
      };

      await addItemToCart(product.id, 1, productForCart, cartId);

      setAddedToCart(product.id);
      setTimeout(() => setAddedToCart(null), 2000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    }
  };

  const handleNavigateToDetail = (slug: string) => {
    navigate(`/products/${slug}`);
  };

  return (
    <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white/70" dir={i18n.dir()}>
      <div className="max-w-7xl mx-auto">
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
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A97155] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p className="text-center">Loading...</p>
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
                    >
                      {t('PRODUCTS.UI.ADD_TO_CART') || 'إضافة للسلة'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-4">{t('PRODUCTS.UI.NO_PRODUCTS_FOUND') || 'No products found'}</h3>
            <p className="text-gray-600 mb-6">{t('PRODUCTS.UI.NO_PRODUCTS_DESCRIPTION') || 'Try changing the search or filter'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsList;

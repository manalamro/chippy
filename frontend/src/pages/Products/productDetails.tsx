import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { selectedProduct, fetchProductBySlug, loading, clearSelectedProduct } = useProductStore();
  const { addItemToCart } = useCartStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (slug) fetchProductBySlug(slug);
    return () => clearSelectedProduct();
  }, [slug, fetchProductBySlug, clearSelectedProduct]);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const guestCartId = localStorage.getItem('guest_cart_id');
    const cartId = user?.id ? String(user.id) : guestCartId || undefined;

    const productForCart = {
      id: selectedProduct.id,
      title: selectedProduct.title,
      price: selectedProduct.price,
      images: selectedProduct.images,
      category: { name: selectedProduct.category_name || '' },
    };

    await addItemToCart(selectedProduct.id, 1, productForCart, cartId);
  };

  if (loading) return <p className="text-center py-12">{t('loading', 'Loading...')}</p>;
  if (!selectedProduct) return <p className="text-center py-12">{t('PRODUCTS.UI.NO_PRODUCTS_FOUND', 'Product not found')}</p>;

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
        <button
          onClick={handleAddToCart}
          className="px-6 py-3 rounded-lg bg-[#D9A441] hover:bg-[#c19038] text-white font-medium transition-all duration-200"
          disabled={selectedProduct.stock === 0}
        >
          {selectedProduct.stock === 0
            ? t('PRODUCTS.UI.OUT_OF_STOCK', 'Out of Stock')
            : t('PRODUCTS.UI.ADD_TO_CART', 'Add to Cart')}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

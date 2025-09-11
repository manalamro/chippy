import React, { useState } from 'react';

import { ChevronDown, ShoppingBag, Star } from 'lucide-react';

interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt: string;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  category_id: number;
  created_at: string;
  images?: ProductImage[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  products?: Product[];
}

// Mock data
const mockData: Category[] = [
  {
    id: 1,
    name: "Artisan Chocolates",
    slug: "artisan-chocolates",
    products: [
      {
        id: 1,
        title: "Dark Chocolate Truffles",
        slug: "dark-chocolate-truffles",
        description: "Rich Belgian dark chocolate truffles with cocoa dusting",
        price: 24.99,
        sku: "CHOC001",
        stock: 50,
        category_id: 1,
        created_at: "2024-01-15",
        images: [{ id: 1, product_id: 1, url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=300&fit=crop", alt: "Dark chocolate truffles" }]
      },
      {
        id: 2,
        title: "Milk Chocolate Bonbons",
        slug: "milk-chocolate-bonbons",
        description: "Creamy milk chocolate bonbons with caramel center",
        price: 19.99,
        sku: "CHOC002",
        stock: 35,
        category_id: 1,
        created_at: "2024-01-16",
        images: [{ id: 2, product_id: 2, url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop", alt: "Milk chocolate bonbons" }]
      },
      {
        id: 3,
        title: "White Chocolate Hearts",
        slug: "white-chocolate-hearts",
        description: "Delicate white chocolate hearts with raspberry filling",
        price: 22.99,
        sku: "CHOC003",
        stock: 28,
        category_id: 1,
        created_at: "2024-01-17",
        images: [{ id: 3, product_id: 3, url: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&h=300&fit=crop", alt: "White chocolate hearts" }]
      }
    ]
  },
  {
    id: 2,
    name: "Fresh Cookies",
    slug: "fresh-cookies",
    products: [
      {
        id: 4,
        title: "Chocolate Chip Cookies",
        slug: "chocolate-chip-cookies",
        description: "Classic homemade chocolate chip cookies, soft and chewy",
        price: 12.99,
        sku: "COOK001",
        stock: 42,
        category_id: 2,
        created_at: "2024-01-18",
        images: [{ id: 4, product_id: 4, url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop", alt: "Chocolate chip cookies" }]
      },
      {
        id: 5,
        title: "Oatmeal Raisin Cookies",
        slug: "oatmeal-raisin-cookies",
        description: "Traditional oatmeal cookies with plump raisins",
        price: 11.99,
        sku: "COOK002",
        stock: 38,
        category_id: 2,
        created_at: "2024-01-19",
        images: [{ id: 5, product_id: 5, url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop", alt: "Oatmeal raisin cookies" }]
      }
    ]
  },
  {
    id: 3,
    name: "Gourmet Cakes",
    slug: "gourmet-cakes",
    products: [
      {
        id: 6,
        title: "Red Velvet Cake",
        slug: "red-velvet-cake",
        description: "Moist red velvet cake with cream cheese frosting",
        price: 45.99,
        sku: "CAKE001",
        stock: 12,
        category_id: 3,
        created_at: "2024-01-20",
        images: [{ id: 6, product_id: 6, url: "https://images.unsplash.com/photo-1586985289906-406988974504?w=300&h=300&fit=crop", alt: "Red velvet cake" }]
      },
      {
        id: 7,
        title: "Chocolate Fudge Cake",
        slug: "chocolate-fudge-cake",
        description: "Decadent triple-layer chocolate fudge cake",
        price: 52.99,
        sku: "CAKE002",
        stock: 8,
        category_id: 3,
        created_at: "2024-01-21",
        images: [{ id: 7, product_id: 7, url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop", alt: "Chocolate fudge cake" }]
      }
    ]
  }
];

const CategorySection = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300&h=300&fit=crop"}
          alt={product.images?.[0]?.alt || product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full p-2">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2" style={{ color: '#3E2723' }}>
          {product.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: '#A97155' }}>
            ${product.price}
          </span>
          <button 
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#D9A441' }}
          >
            Add to Cart
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Stock: {product.stock}</span>
          <span>SKU: {product.sku}</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'white/70' }}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border-2" style={{ borderColor: '#A97155', color: '#A97155' }}>
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-medium">Premium Sweet Treats</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#3E2723' }}>
            Discover Our
            <span className="block" style={{ color: '#A97155' }}>Sweet Collections</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Indulge in our carefully curated selection of artisan chocolates, 
            fresh-baked cookies, and gourmet cakes made with the finest ingredients.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-12">
          {mockData.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const visibleProducts = isExpanded ? category.products : category.products?.slice(0, 3);

            return (
              <div key={category.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border" style={{ borderColor: 'bg-white/70' }}>
                {/* Category Header */}
                <div className="p-8 border-b" style={{ backgroundColor: '#A97155', borderColor: '#A97155' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2" style={{ color: '#FAF3E0' }}>
                        {category.name}
                      </h2>
                      <p className='text-[#FAF3E0]'>
                        {category.products?.length || 0} delicious options available
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1" style={{ color: '#A97155' }}>
                        {category.products?.length || 0}
                      </div>
                      <div className="text-sm text-[#FAF3E0]">Products</div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {visibleProducts?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Show More/Less Button */}
                  {category.products && category.products.length > 3 && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="group flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium transition-all duration-300 hover:scale-105"
                        style={{ 
                          borderColor: '#A97155', 
                          color: isExpanded ? '#FAF3E0' : '#A97155',
                          backgroundColor: isExpanded ? '#A97155' : 'transparent'
                        }}
                      >
                        <span>
                          {isExpanded 
                            ? `Show Less (${category.products.length - 3} hidden)` 
                            : `Show More (${category.products.length - 3} more)`
                          }
                        </span>
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button 
            className="px-8 py-4 text-lg font-semibold text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#A97155' }}
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;

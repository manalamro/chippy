-- Chippy database schema + sample data
-- Run this on a fresh Render PostgreSQL database (via Shell, psql, or pgAdmin)

BEGIN;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image TEXT,
  image_url TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  sku VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT DEFAULT ''
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  notes TEXT DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  UNIQUE (cart_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_id INTEGER NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  total NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Sample admin: admin@chippy.com / admin123
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@chippy.com',
  '$2a$10$AeLpRoFIMtUtIIcQr04qful.KL0H94Pf.PoPRSVVx0tuz0Ig6U26y',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name, slug, image, image_url) VALUES
  ('Electronics', 'electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'),
  ('Fashion', 'fashion', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
  ('Home', 'home', 'home', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
  ('Sports', 'sports', 'sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (title, slug, description, price, sku, stock, category_id) VALUES
  (
    'Wireless Headphones',
    'wireless-headphones',
    'High-quality wireless headphones with noise cancellation.',
    79.99,
    'WH-001',
    50,
    (SELECT id FROM categories WHERE slug = 'electronics')
  ),
  (
    'Smart Watch',
    'smart-watch',
    'Track fitness, notifications, and more.',
    149.99,
    'SW-001',
    30,
    (SELECT id FROM categories WHERE slug = 'electronics')
  ),
  (
    'Classic T-Shirt',
    'classic-t-shirt',
    'Comfortable cotton t-shirt for everyday wear.',
    24.99,
    'TS-001',
    100,
    (SELECT id FROM categories WHERE slug = 'fashion')
  ),
  (
    'Running Shoes',
    'running-shoes',
    'Lightweight shoes designed for running.',
    89.99,
    'RS-001',
    40,
    (SELECT id FROM categories WHERE slug = 'sports')
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_images (product_id, url, alt)
SELECT p.id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', p.title
FROM products p WHERE p.slug = 'wireless-headphones';

INSERT INTO product_images (product_id, url, alt)
SELECT p.id, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', p.title
FROM products p WHERE p.slug = 'smart-watch';

INSERT INTO product_images (product_id, url, alt)
SELECT p.id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', p.title
FROM products p WHERE p.slug = 'classic-t-shirt';

INSERT INTO product_images (product_id, url, alt)
SELECT p.id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', p.title
FROM products p WHERE p.slug = 'running-shoes';

COMMIT;

import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Product Management
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      description,
      price,
      sku,
      stock,
      category_id,
      images
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (title, slug, description, price, sku, stock, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, slug, description, price, sku, stock, category_id]
    );

    const product = result.rows[0];

    // Add images if provided
    if (images && images.length > 0) {
      for (const image of images) {
        await pool.query(
          'INSERT INTO product_images (product_id, url, alt) VALUES ($1, $2, $3)',
          [product.id, image.url, image.alt || '']
        );
      }
    }

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      price,
      sku,
      stock,
      category_id
    } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET title = $1, slug = $2, description = $3, price = $4, sku = $5, stock = $6, category_id = $7
       WHERE id = $8
       RETURNING *`,
      [title, slug, description, price, sku, stock, category_id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Category Management
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, image, image_url } = req.body;

    const result = await pool.query(
      'INSERT INTO categories (name, slug, image, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, image || null, image_url || null]
    );

    res.status(201).json({ message: 'Category created successfully', category: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
      [name, slug, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ message: 'Category updated successfully', category: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productsResult = await pool.query(
      'SELECT id FROM products WHERE category_id = $1 LIMIT 1',
      [id]
    );

    if (productsResult.rows.length > 0) {
      res.status(400).json({ message: 'Cannot delete category with associated products' });
      return;
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Allowed order statuses
const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

// Allowed payment statuses
const allowedPaymentStatuses = ["unpaid", "paid", "refunded", "failed"];

// Order Management
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    // ✅ Validate status
    if (status && !allowedStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
      return;
    }

    // ✅ Validate payment_status
    if (payment_status && !allowedPaymentStatuses.includes(payment_status)) {
      res.status(400).json({
        message: `Invalid payment status. Allowed values: ${allowedPaymentStatuses.join(", ")}`
      });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }

    if (payment_status) {
      paramCount++;
      updates.push(`payment_status = $${paramCount}`);
      values.push(payment_status);
    }

    if (updates.length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    paramCount++;
    values.push(id);

    const result = await pool.query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({
      message: "Order updated successfully",
      order: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders for admin with pagination and optional status filter
export const getAllOrdersForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = `
      SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.created_at,
        u.name as user_name,
        u.email as user_email,
        json_build_object(
          'full_name', a.full_name,
          'phone', a.phone,
          'city', a.city,
          'street', a.street
        ) as address,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'title', p.title,
              'slug', p.slug
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN addresses a ON o.address_id = a.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
    `;

    const queryParams: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` WHERE o.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` GROUP BY o.id, u.id, a.id ORDER BY o.created_at DESC`;

    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(Number(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push((Number(page) - 1) * Number(limit));

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM orders o';
    const countParams: any[] = [];
    if (status) {
      countQuery += ` WHERE o.status = $1`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      orders: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


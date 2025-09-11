import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Get or create cart for user
    let cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    let cartId;
    if (cartResult.rows.length === 0) {
      const newCartResult = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCartResult.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Get cart items with product details
    const itemsResult = await pool.query(
      `SELECT 
        ci.id,
        ci.quantity,
        ci.unit_price,
        p.id as product_id,
        p.title,
        p.slug,
        p.stock,
        pi.url as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.id = (
        SELECT id FROM product_images WHERE product_id = p.id LIMIT 1
      )
      WHERE ci.cart_id = $1`,
      [cartId]
    );

    // Calculate total
    let total = 0;
    const items = itemsResult.rows.map(item => {
      const itemTotal = item.quantity * item.unit_price;
      total += itemTotal;
      return {
        ...item,
        item_total: itemTotal
      };
    });

    res.json({
      cart_id: cartId,
      items,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { product_id, quantity } = req.body;

    // Validate product exists and has enough stock
    const productResult = await pool.query(
      'SELECT id, price, stock FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const product = productResult.rows[0];
    
    if (product.stock < quantity) {
      res.status(400).json({ message: 'Not enough stock available' });
      return;
    }

    // Get or create cart for user
    let cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    let cartId;
    if (cartResult.rows.length === 0) {
      const newCartResult = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCartResult.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Check if product already in cart
    const existingItemResult = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    if (existingItemResult.rows.length > 0) {
      const existingItem = existingItemResult.rows[0];
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        res.status(400).json({ message: 'Not enough stock available' });
        return;
      }

      // Update quantity (removed updated_at)
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existingItem.id]
      );
    } else {
      // Add new item to cart
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [cartId, product_id, quantity, product.price]
      );
    }

    res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    // Verify user owns the cart item
    const itemResult = await pool.query(
      `SELECT ci.id, ci.product_id, p.stock 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [id, userId]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ message: 'Cart item not found' });
      return;
    }

    const item = itemResult.rows[0];
    
    if (item.stock < quantity) {
      res.status(400).json({ message: 'Not enough stock available' });
      return;
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
    } else {
      // Update quantity (removed updated_at)
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [quantity, id]
      );
    }

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Verify user owns the cart item
    const itemResult = await pool.query(
      `SELECT ci.id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [id, userId]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ message: 'Cart item not found' });
      return;
    }

    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);

    res.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
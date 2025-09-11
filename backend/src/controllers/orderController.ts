import { AuthRequest } from '../middleware/auth';
import { Request, Response } from "express";
import pool from "../config/database";

// Type for mock payment
interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
}

// Create order with payment
export const createOrderWithPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const userId = req.user?.userId;
    const { address_id, payment } = req.body;

    // 1️⃣ Check cart
    const cartResult = await client.query(
      `SELECT c.id, SUM(ci.quantity * ci.unit_price) as total
       FROM carts c
       JOIN cart_items ci ON c.id = ci.cart_id
       WHERE c.user_id = $1
       GROUP BY c.id`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    const cart = cartResult.rows[0];

    // 2️⃣ Check address
    const addressResult = await client.query(
      "SELECT id FROM addresses WHERE id = $1 AND user_id = $2",
      [address_id, userId]
    );

    if (addressResult.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "Address not found" });
      return;
    }

    // 3️⃣ Mock payment
    const paymentData: PaymentResponse = {
      success: true,
      transactionId: "txn_" + Date.now()
    };

    // 4️⃣ Check stock & create order items
    const itemsResult = await client.query(
      `SELECT ci.product_id, ci.quantity, ci.unit_price, p.stock, p.title
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    for (const item of itemsResult.rows) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: `Not enough stock for product: ${item.title}` });
        return;
      }
    }

    // 5️⃣ Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, address_id, total, status, payment_status)
       VALUES ($1, $2, $3, 'pending', 'paid')
       RETURNING id`,
      [userId, address_id, cart.total]
    );

    const orderId = orderResult.rows[0].id;

    // 6️⃣ Insert order items and update stock
    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.unit_price]
      );

      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    // 7️⃣ Clear cart
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cart.id]);
    await client.query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [cart.id]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created and payment successful",
      order_id: orderId,
      transactionId: paymentData.transactionId
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// Get all orders for authenticated user
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.created_at,
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
      JOIN addresses a ON o.address_id = a.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id, a.id
      ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

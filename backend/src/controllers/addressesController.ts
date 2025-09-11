// addresses.controller.ts
import { AuthRequest } from '../middleware/auth';
import { Request, Response } from 'express';
import pool from '../config/database';

// Create a new address
export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { full_name, phone, street, city, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO addresses (user_id, full_name, phone, street, city, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, full_name, phone, street, city, notes, is_default`,
      [userId, full_name, phone, street, city, notes || '']
    );

    res.status(201).json({ address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all addresses for checkout
export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT id, full_name, phone, street, city, notes, is_default
       FROM addresses WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

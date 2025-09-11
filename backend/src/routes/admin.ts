import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  getAllOrdersForAdmin, // updated import
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// ✅ Protect all admin routes
router.use(authenticate);
router.use(authorize('ADMIN'));

// Product routes
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category routes
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Order routes
router.get('/orders', getAllOrdersForAdmin); // updated route to use new controller
router.patch('/orders/:id/status', updateOrderStatus);

export default router;

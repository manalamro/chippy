import express from 'express';
import { getProducts, getProductBySlug, getCategories } from '../controllers/productController';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

export default router;
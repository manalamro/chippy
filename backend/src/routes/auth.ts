import express from 'express';
import { signup, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, signupValidation, loginValidation } from '../middleware/validation';

const router = express.Router();

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authenticate, getProfile);

export default router;
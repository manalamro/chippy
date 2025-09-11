import { Router } from 'express';
import { createAddress, getUserAddresses } from '../controllers/addressesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createAddress);
router.get('/', getUserAddresses);

export default router;

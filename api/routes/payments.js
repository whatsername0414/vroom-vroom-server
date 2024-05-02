import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getPayments,
  createPayment,
  updatePayment,
  verifyPayment,
} from '../controllers/payments.js';

const router = express.Router();

router.get('/', auth, getPayments);
router.post('/', auth, createPayment);
router.post('/:id/verify', auth, verifyPayment);
router.patch('/:id', auth, updatePayment);

export default router;

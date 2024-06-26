import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getOrders,
  getOrder,
  getDeliveryFee,
  createOrder,
  cancelOrder,
  confirmOrder,
  acceptOrder,
  pickedupOrder,
  deliveredOrder,
  updateOrderAddress,
  createReview,
} from '../controllers/orders.js';

const router = express.Router();

router.route('/').get(auth, getOrders).post(auth, createOrder);
router.get('/shipping-fee', auth, getDeliveryFee);
router.patch('/:id/cancel', auth, cancelOrder);
router.patch('/:id/update-address', auth, updateOrderAddress);
router.patch('/:id/accept', auth, acceptOrder);
router.patch('/:id/pickedup', auth, pickedupOrder);
router.patch('/:id/delivered', auth, deliveredOrder);
router.put('/:id/review', auth, createReview);
router.route('/:id').get(auth, getOrder).patch(auth, confirmOrder);

export default router;

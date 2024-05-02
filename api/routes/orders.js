import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getOrders,
  getOrder,
  getDeliveryFee,
  createOrder,
  cancelOrder,
  confirmOrder,
  pickOrder,
  purchasedOrder,
  arrived,
  deliveredOrder,
  updateOrderAddress,
  createReview,
} from '../controllers/orders.js';

const router = express.Router();

router.get('/', auth, getOrders);
router.get('/shipping-fee', auth, getDeliveryFee);
router.post('/', auth, createOrder);
router.patch('/:id/cancel', auth, cancelOrder);
router.patch('/:id/update-address', auth, updateOrderAddress);
router.patch('/:id/pick', auth, pickOrder);
router.patch('/:id/purchased', auth, purchasedOrder);
router.patch('/:id/arrived', auth, arrived);
router.patch('/:id/delivered', auth, deliveredOrder);
router.put('/:id/review', auth, createReview);
router.route('/:id').get(auth, getOrder).patch(auth, confirmOrder);

export default router;

import express from 'express';
import { upload } from '../middleware/mutler.js';
import { auth } from '../middleware/auth.js';
import { merchantMiddleware } from '../middleware/merchantMiddleware.js';
import {
  getMerchant,
  getMerchants,
  getFavorites,
  favorite,
  createMerchant,
  updateMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductSection,
  editProductSection,
  deleteProductSection,
} from '../controllers/merchants.js';

const router = express.Router();

router
  .route('/:id/products/:productSectionId/:productId')
  .put(auth, upload, updateProduct)
  .delete(auth, deleteProduct);
router.get('/', getMerchants, merchantMiddleware);
router.post('/', auth, createMerchant, merchantMiddleware);
router.post('/:id/products/:productSectionId', auth, upload, createProduct);
router.put('/:id/favorite', auth, favorite);
router.get('/favorites', auth, getFavorites, merchantMiddleware);
router
  .route('/:id')
  .get(getMerchant, merchantMiddleware)
  .patch(auth, updateMerchant, merchantMiddleware)
  .post(auth, addProductSection, merchantMiddleware);
router
  .route('/:id/:productSectionId')
  .put(auth, editProductSection, merchantMiddleware)
  .delete(auth, deleteProductSection, merchantMiddleware);

export default router;

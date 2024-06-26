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
  .route('/:merchantId/products')
  .post(auth, upload, createProduct)
  .put(auth, upload, updateProduct)
  .delete(auth, deleteProduct);
router
  .route('/')
  .get(auth, getMerchants, merchantMiddleware)
  .post(auth, createMerchant, merchantMiddleware);
router.get('/unauthorized', getMerchants, merchantMiddleware);
router.put('/:merchantId/favorite', auth, favorite);
router.get('/favorites', auth, getFavorites, merchantMiddleware);
router
  .route('/:merchantId')
  .get(getMerchant, merchantMiddleware)
  .patch(auth, updateMerchant, merchantMiddleware)
  .post(auth, addProductSection, merchantMiddleware);
router
  .route('/:merchantId/:productSectionId')
  .put(auth, editProductSection, merchantMiddleware)
  .delete(auth, deleteProductSection, merchantMiddleware);

export default router;

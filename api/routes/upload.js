import express from 'express';
import { upload } from '../middleware/mutler.js';
import { auth } from '../middleware/auth.js';
import { uploadImage } from '../controllers/upload.js';

const router = express.Router();

router.post('/', auth, upload, uploadImage);

export default router;

import express from 'express';
import {
  loginAdmin,
  registerAdmin,
  register,
  generateEmailOtp,
  vertifyEmailOtp,
} from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/register/admin', registerAdmin);
router.post('/register', auth, register);
router.post('/email-otp', generateEmailOtp);
router.post('/verify-email-otp', vertifyEmailOtp);

export default router;

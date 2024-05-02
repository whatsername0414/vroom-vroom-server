import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getUsers,
  getUser,
  updateName,
  updateAddress,
  generatePhoneOtp,
  verifyPhoneOtp,
} from "../controllers/users.js";

const router = express.Router();

router.get("/", auth, getUsers);
router.get("/me", auth, getUser);
router.patch("/me/update-name", auth, updateName);
router.post("/me/phone-otp", auth, generatePhoneOtp);
router.post("/me/verify-phone-otp", auth, verifyPhoneOtp);

export default router;

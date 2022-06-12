import express from "express";
import auth from "../middleware/auth.js";
import {
  getUser,
  register,
  updateName,
  updateAddress,
  registerPhoneNumber,
  verifyOtp,
} from "../controllers/users.js";

const router = express.Router();

router.get("/", auth, getUser);
router.post("/", auth, register);
router.patch("/update-name", auth, updateName);
router.post("/register-phone-number", auth, registerPhoneNumber);
router.post("/verify", auth, verifyOtp);

export default router;

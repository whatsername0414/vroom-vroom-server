import express from "express";
import auth from "../middleware/auth.js";
import {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  updateOrderAddress,
  createReview,
} from "../controllers/orders.js";

const router = express.Router();

router.get("/", auth, getOrders);
router.post("/", auth, createOrder);
router.patch("/:id/cancel", auth, cancelOrder);
router.patch("/:id/update-address", auth, updateOrderAddress);
router.put("/:id/review", auth, createReview);
router.get("/:id", auth, getOrder);

export default router;

import express from "express";
import auth from "../middleware/auth.js";
import {
  getMerchant,
  getMerchants,
  getFavorites,
  favorite,
  createMerchant,
} from "../controllers/merchants.js";

const router = express.Router();

router.get("/", getMerchants);
router.post("/", auth, createMerchant);
router.put("/:id/favorite", auth, favorite);
router.get("/favorites", auth, getFavorites);
router.get("/:id", getMerchant);

export default router;

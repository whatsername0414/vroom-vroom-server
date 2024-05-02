import express from "express";
import { getCategories, createCategory } from "../controllers/categories.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createCategory);
router.get("/", getCategories);

export default router;

import express from "express";
import Category from "../models/Category.js";
Category;

const router = express.Router();

//CREATE
router.post("/", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json(error);
  }
});

//READ
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ type: req.query.type });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;

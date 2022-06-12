import Category from "../models/Category.js";
import checkAuth from "../utils/check-auth.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: type });
    res.status(200).json({ data: categories });
  } catch (error) {
    throw new Error(error);
  }
};

export const createCategory = async (req, res) => {
  if (req.headers.authorization && checkAuth(req.headers.authorization)?.sub) {
    const { name, imageUrl, type } = req.body;
    try {
      const newCategory = new Category(name, imageUrl, type);
      const saveCategory = await newCategory.save();
      res.status(201).json({ data: saveCategory });
    } catch (error) {
      throw new Error(error);
    }
  } else {
    res
      .status(401)
      .json({ data: { message: "Authorization header must be provided" } });
  }
};

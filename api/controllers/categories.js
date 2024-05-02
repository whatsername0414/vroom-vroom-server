import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const { type } = req.query;
  try {
    const categories = await Category.find({ type: type });
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const createCategory = async (req, res) => {
  const { name, imageUrl, type } = req.body;
  try {
    const newCategory = new Category(name, imageUrl, type);
    const saveCategory = await newCategory.save();
    res.status(201).json({ data: saveCategory });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

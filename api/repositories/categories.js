import Category from "../models/Category.js";

const categories = {
  categories: async (type) => {
    try {
      const categories = await Category.find({ type: type });
      return categories;
    } catch (error) {
      throw new Error(error);
    }
  },
  createCategory: async (name, imageUrl, type) => {
    try {
      const newCategory = new Category(name, imageUrl, type);
      const saveCategory = await newCategory.save();
      return saveCategory;
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default categories;

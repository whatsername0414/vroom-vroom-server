import Merchant from '../models/mechant/Merchant.js';
import ProductSection from '../models/mechant/ProductSection.js';
import Product from '../models/mechant/Product.js';
import OptionSection from '../models/mechant/OptionSection.js';
import Option from '../models/mechant/Option.js';
import mongoose from 'mongoose';
import checkAuth from '../utils/check-auth.js';

export const getMerchant = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.headers.authorization
    ? checkAuth(req.headers.authorization)?.sub
    : undefined;
  try {
    const merchant = await Merchant.findById(id)
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'product_sections',
        populate: {
          path: 'products',
          populate: {
            path: 'option_sections',
            populate: {
              path: 'option',
            },
          },
        },
      });
    req.data = [merchant];
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const getMerchants = async (req, res, next) => {
  try {
    const category = req.query.category;
    const searchTerm = req.query.searchTerm;
    const query = category
      ? { $match: { categories: mongoose.Types.ObjectId(category) } }
      : searchTerm
      ? {
          $search: {
            index: 'searchMerchants',
            text: { query: searchTerm, path: { wildcard: '*' }, fuzzy: {} },
          },
        }
      : { $unwind: { path: '$merchants', preserveNullAndEmptyArrays: true } };
    const merchants = await Merchant.aggregate([
      query,
      {
        $project: {
          id: '$_id',
          name: 1,
          image: 1,
          rates: 1,
          categories: 1,
          closing: 1,
          opening: 1,
        },
      },
    ]);
    req.data = merchants;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const getFavorites = async (req, _, next) => {
  try {
    const merchants = await Merchant.aggregate([
      { $match: { favorites: { $elemMatch: { user: req.userId } } } },
      {
        $project: {
          id: '$_id',
          name: 1,
          image: 1,
          rates: 1,
          categories: 1,
          closing: 1,
          opening: 1,
          rates: { $size: '$reviews' },
          ratings: { $avg: '$reviews.rate' },
        },
      },
      {
        $set: { favorite: true },
      },
    ]);
    req.data = merchants;
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const favorite = async (req, res) => {
  const { id } = req.params;
  try {
    const merchant = await Merchant.findById(id);
    const index = merchant.favorites.findIndex(
      ({ user_id }) => user_id === req.userId
    );
    const updatedMerchant =
      index === -1
        ? await Merchant.updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $push: { favorites: { user: req.userId } } },
            { new: true }
          )
        : await Merchant.updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $pull: { favorites: { user: req.userId } } },
            { new: true }
          );
    if (updatedMerchant.acknowledged === true) {
      res.status(201).json({
        data: {
          message:
            index === -1
              ? 'Added to your favorite'
              : 'Removed to your favorite',
        },
      });
    } else {
      res
        .status(500)
        .json({ data: { message: 'Unable to complete operation' } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const createMerchant = async (req, res, next) => {
  try {
    const defaultProductSection = {
      name: 'New Product Section',
      products: [],
    };
    const newProductSection = new ProductSection(defaultProductSection);
    const productSection = await newProductSection.save();

    const defaultMerchant = {
      name: 'New Merchant',
      image: '1659883565513-vroomvroom_logo.png',
      product_sections: [productSection._id],
      categories: ['66312184ec6490b587f6a2fb'],
      closing: 70200,
      opening: 25200,
      location: [13.359218, 123.729698],
    };
    const newMerchant = new Merchant(defaultMerchant);
    const savedMerchant = await newMerchant.save();

    const merchant = await Merchant.findById(savedMerchant._id)
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'product_sections',
        populate: {
          path: 'products',
          populate: {
            path: 'option_sections',
            populate: {
              path: 'option',
            },
          },
        },
      });

    req.data = [merchant];
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const updateMerchant = async (req, res, next) => {
  const { id } = req.params;
  const { name, image, categories, opening, closing, location } = req.body;
  try {
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      {
        _id: mongoose.Types.ObjectId(id),
      },
      {
        $set: {
          name: name,
          image: image,
          categories: categories,
          opening: opening,
          closing: closing,
          location: location,
        },
      },
      { new: true }
    );
    const merchant = await Merchant.findById(updatedMerchant._id)
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'product_sections',
        populate: {
          path: 'products',
          populate: {
            path: 'option_sections',
            populate: {
              path: 'option',
            },
          },
        },
      });
    req.data = [merchant];
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const addProductSection = async (req, res, next) => {
  const { id } = req.params;
  const { productSection } = req.body;
  try {
    const newProductSection = new ProductSection(productSection);
    const savedProductSection = await newProductSection.save();

    const merchant = await Merchant.findByIdAndUpdate(
      id,
      { $push: { product_sections: savedProductSection._id } },
      { new: true, useFindAndModify: false }
    )
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'product_sections',
        populate: {
          path: 'products',
          populate: {
            path: 'option_sections',
            populate: {
              path: 'option',
            },
          },
        },
      });
    req.data = [merchant];
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const editProductSection = async (req, res, next) => {
  const { id } = req.params;
  const { productSectionId } = req.params;
  const { productSection } = req.body;
  try {
    await ProductSection.findByIdAndUpdate(
      {
        _id: mongoose.Types.ObjectId(productSectionId),
      },
      {
        $set: productSection,
      },
      { new: true }
    );
    const merchant = await Merchant.findById(id)
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'product_sections',
        populate: {
          path: 'products',
          populate: {
            path: 'option_sections',
            populate: {
              path: 'option',
            },
          },
        },
      });
    req.data = [merchant];
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const deleteProductSection = async (req, res, next) => {
  const { id } = req.params;
  const { productSectionId } = req.params;
  try {
    await ProductSection.findByIdAndDelete(productSectionId);
    const merchant = await Merchant.findByIdAndUpdate(
      id,
      { $pull: { product_sections: productSectionId } },
      { new: true, useFindAndModify: false }
    )
      .populate({
        path: 'categories',
      })
      .populate({
        path: 'product_sections',
        populate: {
          path: 'products',
          populate: {
            path: 'option_sections',
            populate: {
              path: 'option',
            },
          },
        },
      });
    req.data = [merchant];
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const createProduct = async (req, res) => {
  const { productSectionId } = req.params;
  const { product } = req.body;
  try {
    const optionSections = [];
    product.option_sections.forEach(async (section) => {
      const options = [];
      section.options.forEach(async (option) => {
        const newOption = new Option({
          name: option.name,
          price: option.price,
        });
        const savedOption = await newOption.save();
        options.push(savedOption._id);
      });
      const newOptionSection = new OptionSection({
        name: section.name,
        required: section.required,
        options: options,
      });
      const savedOptonSection = await newOptionSection.save();
      optionSections.push(savedOptonSection._id);
    });
    const newProduct = new Product({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      option_sections: optionSections,
    });
    const savedProduct = await newProduct.save();

    await ProductSection.findByIdAndUpdate(
      productSectionId,
      { $push: { products: savedProduct._id } },
      { new: true, useFindAndModify: false }
    );
    res.status(201).json({
      data: {
        productId: savedProduct._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id, productSectionId, productId } = req.params;
  const { product } = req.body;
  try {
    const updatedMerchant = await Merchant.updateOne(
      {
        _id: mongoose.Types.ObjectId(id),
      },
      { $set: { 'product_sections.$[section].products.$[product]': product } },
      {
        arrayFilters: [
          { 'section._id': mongoose.Types.ObjectId(productSectionId) },
          { 'product._id': mongoose.Types.ObjectId(productId) },
        ],
      }
    );
    if (updatedMerchant.acknowledged === true) {
      res.status(200).json({
        data: {
          message: 'Product updated',
        },
      });
    } else {
      res
        .status(500)
        .json({ data: { message: 'Unable to complete operation' } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id, productSectionId, productId } = req.params;
  try {
    const updatedMerchant = await Merchant.updateOne(
      {
        _id: mongoose.Types.ObjectId(id),
      },
      {
        $pull: {
          'product_sections.$[section].products': {
            _id: mongoose.Types.ObjectId(productId),
          },
        },
      },
      {
        arrayFilters: [
          { 'section._id': mongoose.Types.ObjectId(productSectionId) },
        ],
      }
    );
    if (updatedMerchant.acknowledged === true) {
      res.status(204).json({ data: { message: 'Product deleted' } });
    } else {
      res
        .status(500)
        .json({ data: { message: 'Unable to complete operation' } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

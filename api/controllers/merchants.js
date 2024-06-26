import Merchant from '../models/Merchant.js';
import ProductSection from '../models/ProductSection.js';
import Product from '../models/Product.js';
import OptionSection from '../models/OptionSection.js';
import Option from '../models/Option.js';
import mongoose from 'mongoose';
import Review from '../models/Review.js';

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
      .lean()
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
              path: 'options',
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

export const getMerchant = async (req, res, next) => {
  const { merchantId } = req.params;
  try {
    const merchant = await Merchant.findById(merchantId)
      .lean()
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
              path: 'options',
            },
          },
        },
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
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
    const searchTerm = req.query.searchTerm;
    if (searchTerm) {
      const merchants = await Merchant.aggregate([
        {
          $lookup: {
            from: 'productsections',
            localField: 'product_sections',
            foreignField: '_id',
            as: 'productSections',
          },
        },
        {
          $unwind: '$productSections',
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productSections.products',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $unwind: '$products',
        },
        {
          $lookup: {
            from: 'reviews',
            localField: 'reviews',
            foreignField: '_id',
            as: 'reviews',
          },
        },
        {
          $unwind: {
            path: '$reviews',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'reviews.user',
            foreignField: '_id',
            as: 'reviews.user',
          },
        },
        {
          $unwind: {
            path: '$reviews.user',
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { 'products.name': { $regex: searchTerm, $options: 'i' } },
              {
                'products.description': { $regex: searchTerm, $options: 'i' },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            image: { $first: '$image' },
            location: { $first: '$location' },
            opening: { $first: '$opening' },
            closing: { $first: '$closing' },
            reviews: {
              $push: {
                _id: '$reviews._id',
                rating: '$reviews.rating',
                comment: '$reviews.comment',
                user: '$reviews.user',
              },
            },
            created_at: { $first: '$created_at' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);
      req.data = merchants;
      next();
    } else {
      const merchants = await Merchant.find({})
        .lean()
        .select('-product_sections')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
          },
        });
      req.data = merchants;
      next();
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const updateMerchant = async (req, res, next) => {
  const { merchantId } = req.params;
  const { name, image, opening, closing, location } = req.body;
  try {
    const merchant = await Merchant.findByIdAndUpdate(
      {
        _id: mongoose.Types.ObjectId(merchantId),
      },
      {
        $set: {
          name: name,
          image: image,
          opening: opening,
          closing: closing,
          location: location,
        },
      },
      { new: true }
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
              path: 'options',
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
  const { merchantId } = req.params;
  const { productSection } = req.body;

  try {
    const newProductSection = new ProductSection(productSection);
    const savedProductSection = await newProductSection.save();

    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { $push: { product_sections: savedProductSection._id } },
      { new: true }
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
              path: 'options',
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
  const { merchantId } = req.params;
  const { productSectionId } = req.params;
  const { productSection } = req.body;
  try {
    await ProductSection.findByIdAndUpdate(
      {
        _id: mongoose.Types.ObjectId(productSectionId),
      },
      {
        $set: { name: productSection.name },
      },
      { new: true }
    );
    const merchant = await Merchant.findById(merchantId)
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
              path: 'options',
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
  const { merchantId } = req.params;
  const { productSectionId } = req.params;
  try {
    await ProductSection.findByIdAndDelete(productSectionId);
    const merchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { $pull: { product_sections: productSectionId } },
      { new: true }
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
              path: 'options',
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
  const { productSectionId, product } = req.body;
  try {
    const optionSections = [];
    for (const section of product.option_sections) {
      const options = [];
      for (const option of section.options) {
        const newOption = new Option({
          name: option.name,
          price: option.price,
        });
        const savedOption = await newOption.save();
        options.push(savedOption._id);
      }
      const newOptionSection = new OptionSection({
        name: section.name,
        required: section.required,
        options: options,
      });
      const savedOptonSection = await newOptionSection.save();
      optionSections.push(savedOptonSection._id);
    }
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
      { new: true }
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
  const { product } = req.body;
  try {
    const optionSections = [];
    for (const section of product.option_sections) {
      const options = [];
      for (const option of section.options) {
        const docs = await Option.findByIdAndUpdate(
          option._id,
          { $set: option },
          {
            new: true,
          }
        );
        if (!docs) {
          const newOption = new Option({
            name: option.name,
            price: option.price,
          });
          const savedOption = await newOption.save();
          options.push(savedOption._id);
        } else {
          options.push(docs._id);
        }
      }
      const docs = await OptionSection.findByIdAndUpdate(
        section._id,
        {
          $set: {
            name: section.name,
            required: section.required,
            options: options,
          },
        },
        {
          new: true,
        }
      );
      if (!docs) {
        const newOptionSection = new OptionSection({
          name: section.name,
          required: section.required,
          options: options,
        });
        const savedOptonSection = await newOptionSection.save();
        optionSections.push(savedOptonSection._id);
      } else {
        optionSections.push(docs._id);
      }
    }

    await Product.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(product._id),
      },
      {
        $set: {
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          option_sections: optionSections,
        },
      }
    );
    res.status(200).json({
      data: {
        message: 'Product updated',
      },
    });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { productSectionId, productId } = req.body;
  try {
    await Product.findByIdAndDelete(productId);
    await ProductSection.findByIdAndUpdate(productSectionId, {
      $pull: { products: productId },
    });
    res.status(204).json({ data: { message: 'Product deleted' } });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const getFavorites = async (req, _, next) => {
  try {
    const merchants = await Merchant.find({ favorites: req.userId })
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
              path: 'options',
            },
          },
        },
      });
    req.data = merchants;
    next();
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const favorite = async (req, res) => {
  const { merchantId } = req.params;
  try {
    const merchant = await Merchant.findById(id);
    const index = merchant.favorites.findIndex(
      ({ user_id }) => user_id === req.userId
    );
    const updatedMerchant =
      index === -1
        ? await Merchant.updateOne(
            { _id: mongoose.Types.ObjectId(merchantId) },
            { $push: { favorites: req.userId } },
            { new: true }
          )
        : await Merchant.updateOne(
            { _id: mongoose.Types.ObjectId(merchantId) },
            { $pull: { favorites: req.userId } },
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

export const createReview = async (req, res) => {
  const { merchantId, rating, comment } = req.body;
  try {
    const newReview = new Review({
      user: req.userId,
      rating: rating,
      comment: comment,
    });
    const savedReview = await newReview.save();

    await Merchant.updateOne(
      { _id: mongoose.Types.ObjectId(merchantId) },
      { $push: { reviews: savedReview._id } },
      { new: true }
    );
    res.status(201).json({
      data: {
        message: 'Review successfully saved',
      },
    });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

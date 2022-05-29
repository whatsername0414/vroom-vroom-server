import Merchant from "../models/Merchant.js";
import mongoose from "mongoose";

const merchants = {
  merchants: async (userId) => {
    try {
      const merchants = await Merchant.aggregate([
        {
          $project: {
            id: "$_id",
            name: 1,
            img_url: 1,
            rates: 1,
            categories: 1,
            product_sections: 1,
            closing: 1,
            opening: 1,
            location: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
            favorite: { $in: [userId, "$favorites.user_id"] },
          },
        },
      ]);
      return merchants;
    } catch (error) {
      throw new Error(error);
    }
  },
  merchantsByCategory: async (userId, category) => {
    try {
      const merchants = await Merchant.aggregate([
        { $match: { categories: category } },
        {
          $project: {
            id: "$_id",
            name: 1,
            img_url: 1,
            rates: 1,
            categories: 1,
            product_sections: 1,
            closing: 1,
            opening: 1,
            location: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
            favorite: { $in: [userId, "$favorites.user_id"] },
          },
        },
      ]);
      return merchants;
    } catch (error) {
      throw new Error(error);
    }
  },
  merchantsSearch: async (userId, searchTerm) => {
    try {
      const merchants = await Merchant.aggregate([
        {
          $search: {
            index: "searchMerchants",
            text: {
              query: searchTerm,
              path: {
                wildcard: "*",
              },
              fuzzy: {},
            },
          },
        },
        {
          $project: {
            id: "$_id",
            name: 1,
            img_url: 1,
            rates: 1,
            categories: 1,
            product_sections: 1,
            closing: 1,
            opening: 1,
            location: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
            favorite: { $in: [userId, "$favorites.user_id"] },
          },
        },
      ]);
      return merchants;
    } catch (error) {
      throw new Error(error);
    }
  },
  favorite: async (userId) => {
    try {
      const merchants = await Merchant.aggregate([
        { $match: { favorites: { $elemMatch: { user_id: userId } } } },
        {
          $project: {
            id: "$_id",
            name: 1,
            img_url: 1,
            rates: 1,
            categories: 1,
            product_sections: 1,
            closing: 1,
            opening: 1,
            location: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
          },
        },
        {
          $set: { favorite: true },
        },
      ]);
      return merchants;
    } catch (error) {
      throw new Error(error);
    }
  },
  addFavorite: async (merchantId, userId) => {
    try {
      const updatedMerchant = await Merchant.updateOne(
        { _id: mongoose.Types.ObjectId(merchantId) },
        { $push: { favorites: { user_id: userId } } },
        { new: true }
      );
      if (updatedMerchant.acknowledged === true) {
        return "Success";
      } else {
        throw new Error("Unable to add from favorite");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  removeFavorite: async (merchantId, userId) => {
    try {
      const updatedMerchant = await Merchant.updateOne(
        { _id: mongoose.Types.ObjectId(merchantId) },
        { $pull: { favorites: { user_id: userId } } },
        { new: true }
      );
      if (updatedMerchant.acknowledged === true) {
        return "Success";
      } else {
        throw new Error("Unable to add from favorite");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  addMerchant: async (merchant) => {
    try {
      const newMerchant = new Merchant(merchant);
      await newMerchant.save();
      return "Success";
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default merchants;

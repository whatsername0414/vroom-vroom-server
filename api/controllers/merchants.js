import Merchant from "../models/Merchant.js";
import mongoose from "mongoose";
import checkAuth from "../utils/check-auth.js";

export const getMerchant = async (req, res) => {
  let userId;
  if (req.headers.authorization) {
    userId = checkAuth(req.headers.authorization)?.sub;
  }
  try {
    const merchant = await Merchant.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(merchantId) } },
      {
        $project: {
          id: "$_id",
          name: 1,
          img_url: 1,
          reviews: 1,
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
    if (merchant) {
      res.status(200).json({ data: merchant });
    } else {
      res.status(404).json({ data: { message: "Merchant not found" } });
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const getMerchants = async (req, res) => {
  let userId;
  const category = req.query.category;
  const searchTerm = req.query.searchTerm;
  if (req.headers.authorization) {
    userId = checkAuth(req.headers.authorization)?.sub;
  }
  try {
    let merchants;
    if (category) {
      merchants = await Merchant.aggregate([
        { $match: { categories: category } },
        {
          $project: {
            id: "$_id",
            name: 1,
            img_url: 1,
            rates: 1,
            categories: 1,
            closing: 1,
            opening: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
            favorite: { $in: [userId, "$favorites.user_id"] },
          },
        },
      ]);
    } else if (searchTerm) {
      merchants = await Merchant.aggregate([
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
            closing: 1,
            opening: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
            favorite: { $in: [userId, "$favorites.user_id"] },
          },
        },
      ]);
    } else {
      merchants = await Merchant.aggregate([
        {
          $project: {
            id: "$_id",
            name: 1,
            img_url: 1,
            rates: 1,
            categories: 1,
            closing: 1,
            opening: 1,
            rates: { $size: "$reviews" },
            ratings: { $avg: "$reviews.rate" },
            favorite: { $in: [userId, "$favorites.user_id"] },
          },
        },
      ]);
    }
    res.status(200).json({ data: merchants });
  } catch (error) {
    throw new Error(error);
  }
};
export const getFavorites = async (req, res) => {
  try {
    const merchants = await Merchant.aggregate([
      { $match: { favorites: { $elemMatch: { user_id: req.userId } } } },
      {
        $project: {
          id: "$_id",
          name: 1,
          img_url: 1,
          rates: 1,
          categories: 1,
          closing: 1,
          opening: 1,
          rates: { $size: "$reviews" },
          ratings: { $avg: "$reviews.rate" },
        },
      },
      {
        $set: { favorite: true },
      },
    ]);
    res.status(200).json({ data: merchants });
  } catch (error) {
    throw new Error(error);
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
            { $push: { favorites: { user_id: req.userId } } },
            { new: true }
          )
        : await Merchant.updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { $pull: { favorites: { user_id: req.userId } } },
            { new: true }
          );
    if (updatedMerchant.acknowledged === true) {
      res.status(201).json({
        data: {
          message:
            index === -1
              ? "Added to your favorite"
              : "Removed to your favorite",
        },
      });
    } else {
      res
        .status(500)
        .json({ data: { message: "Unable to complete operation" } });
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const createMerchant = async (req, res) => {
  const { merchant } = req.body;
  try {
    const newMerchant = new Merchant(merchant);
    const savedMerchant = await newMerchant.save();
    res.status(201).json({ data: savedMerchant });
  } catch (error) {
    throw new Error(error);
  }
};

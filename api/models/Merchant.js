import mongoose from "mongoose";

const ProductSectionSchema = new mongoose.Schema({
  name: String,
  products: [
    {
      name: String,
      product_img_url: String,
      price: Number,
      description: String,
      option: [
        {
          name: String,
          required: {
            type: Boolean,
            default: false,
          },
          choice: [
            {
              name: String,
              additional_price: Number,
            },
          ],
        },
      ],
    },
  ],
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

const ReviewSchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: "User",
  },
  rate: Number,
  _review: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

const FavoriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      ref: "User",
    },
    created_at: {
      type: Date,
      default: () => Date.now(),
    },
  },
  { _id: false }
);

const MerchantSchema = new mongoose.Schema({
  name: String,
  img_url: String,
  product_categories: [String],
  product_sections: [ProductSectionSchema],
  categories: [String],
  location: [String],
  reviews: [ReviewSchema],
  favorites: [FavoriteSchema],
  opening: String,
  closing: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model("Merchant", MerchantSchema);

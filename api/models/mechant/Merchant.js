import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
  },
  rate: Number,
  comment: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: 'User',
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
  image: String,
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
  product_sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductSection',
    },
  ],
  location: [Number],
  opening: String,
  closing: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Merchant', MerchantSchema);

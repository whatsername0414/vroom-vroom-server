import mongoose from 'mongoose';

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
  favorites: [String],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

export default mongoose.model('Merchant', MerchantSchema);

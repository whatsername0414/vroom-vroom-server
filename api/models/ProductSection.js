import mongoose from 'mongoose';

const ProductSectionSchema = new mongoose.Schema({
  name: String,
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('ProductSection', ProductSectionSchema);

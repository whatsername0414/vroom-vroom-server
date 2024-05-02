import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  option_sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OptionSection',
    },
  ],
  name: String,
  image: String,
  price: Number,
  description: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Product', ProductSchema);

import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  name: String,
  price: Number,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Option', OptionSchema);

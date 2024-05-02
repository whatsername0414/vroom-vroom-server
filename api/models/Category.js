import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: String,
  image: String,
  type: String,
  created_at: { type: Date, default: () => Date.now() },
});

export default mongoose.model('Category', CategorySchema);

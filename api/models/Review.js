import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
  },
  rating: Number,
  comment: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Review', ReviewSchema);

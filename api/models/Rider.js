import mongoose from 'mongoose';

const RiderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: {
    number: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Rider', RiderSchema);

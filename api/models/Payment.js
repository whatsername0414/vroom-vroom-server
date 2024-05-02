import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  sender: {
    type: String,
    ref: 'User',
  },
  method: String,
  amount: Number,
  balance: Number,
  reference_id: String,
  status: { type: String, default: 'Pending' },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Payment', paymentSchema);

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  fcm_token: String,
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

export default mongoose.model('User', UserSchema);

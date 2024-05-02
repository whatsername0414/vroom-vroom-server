import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: String,
  name: String,
  email: String,
  type: {
    type: String,
    default: 'user',
  },
  fcm_token: String,
  phone: {
    number: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
  location: {
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    additional_information: {
      type: String,
      default: null,
    },
    coordinates: [Number],
  },
  picked_order: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Order',
    default: null,
  },
  pending_payment: {
    type: String,
    ref: 'Payment',
    default: null,
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('User', UserSchema);

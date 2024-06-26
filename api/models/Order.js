import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customer: {
    type: String,
    ref: 'User',
  },
  merchant: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Merchant',
  },
  rider: {
    type: String,
    ref: 'User',
    default: null,
  },
  address: {
    street: {
      type: String,
      default: null,
    },
    barangay: String,
    city: String,
    additional_information: {
      type: String,
      default: null,
    },
    latitude: Number,
    longitude: Number,
  },
  products: [
    {
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
      },
      options: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Option',
        },
      ],
      quantity: Number,
      price: Number,
      notes: String,
    },
  ],
  delivery_fee: Number,
  status: { type: Number, default: 0 },
  cancellation_reason: { type: String, default: null },
  notified: {
    type: Boolean,
    default: false,
  },
  reviewed: {
    type: Boolean,
    default: false,
  },
  created_at: { type: Date, default: () => Date.now() },
});

export default mongoose.model('Order', OrderSchema);

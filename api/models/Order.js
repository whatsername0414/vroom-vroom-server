import mongoose from 'mongoose';

const OrderProductSchema = new mongoose.Schema({
  product_id: String,
  name: String,
  product_img_url: String,
  price: Number,
  quantity: Number,
  instructions: String,
  options: [
    {
      name: String,
      additional_price: Number,
      option_type: String,
    },
  ],
});

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
  payment: {
    type: String,
    ref: 'Payment',
  },
  delivery_address: {
    address: String,
    city: String,
    additional_information: {
      type: String,
      default: null,
    },
    coordinates: [Number],
  },
  order_detail: {
    delivery_fee: Number,
    total_price: Number,
    products: [OrderProductSchema],
  },
  status: {
    label: { type: String, default: 'Pending' },
    ordinal: { type: Number, default: 0 },
  },
  cancellation_reason: { type: String, default: null },
  created_at: { type: Date, default: () => Date.now() },
  notified: {
    type: Boolean,
    default: false,
  },
  reviewed: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Order', OrderSchema);

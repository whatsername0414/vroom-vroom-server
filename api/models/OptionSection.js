import mongoose from 'mongoose';

const OptionSectionSchema = new mongoose.Schema({
  name: String,
  required: {
    type: Boolean,
    default: false,
  },
  options: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Option',
    },
  ],
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('OptionSection', OptionSectionSchema);

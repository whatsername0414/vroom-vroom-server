import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true,
  },
  password: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Admin', AdminSchema);

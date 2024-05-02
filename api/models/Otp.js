import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  user: String,
  receiver: String,
  otp: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
    index: { expires: 300 },
  },
});

export default mongoose.model("Otp", otpSchema);

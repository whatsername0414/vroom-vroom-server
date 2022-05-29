import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import orders from "./routes/orders.js";
import merchants from "./routes/merchants.js";
import categories from "./routes/categories.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});
app.use(express.json());
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/orders", orders);
app.use("/api/v1/merchants", merchants);
app.use("/api/v1/categories", categories);

app.listen(port, () => {
  connect();
  console.log(`Connected to port: ${port}`);
});

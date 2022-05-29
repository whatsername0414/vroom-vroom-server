import express from "express";
import User from "../models/User.js";

const router = express.Router();

//CREATE
router.post("/", async (req, res) => {
  try {
    const newUser = new User(req.body);
    console.log(req.body);
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//READ

//UPDATE

//DELETE

export default router;

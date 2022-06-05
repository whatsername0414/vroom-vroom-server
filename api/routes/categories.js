import express from "express";
import repository from "../repositories/categories.js";

const router = express.Router();

//CREATE
router.post("/", (req, res) => {
  if (req.headers.authorization) {
    const name = req.body.name;
    const imageUrl = req.body.imageUrl;
    const type = req.body.type;
    const promise = repository.createCategory(name, imageUrl, type);
    promise.then((category) => {
      res.status(201).json({ data: category });
    });
  } else {
    throw new Error("Authorization header must be provided");
  }
});

//READ
router.get("/", (req, res) => {
  const type = req.query.type;
  repository.categories(type).then((categories) => {
    res.status(200).json({ data: categories });
  });
});

export default router;

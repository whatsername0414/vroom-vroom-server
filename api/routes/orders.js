import express from "express";

const router = express.Router();

router.get("/", (_, res) => {
  res.send("Hello from auth");
});

export default router;

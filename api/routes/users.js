import express from "express";
import users from "../repositories/users.js";
import checkAuth from "../utils/check-auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  if (req.headers.authorization) {
    const user = checkAuth(req.headers.authorization);
    users.user(user.user_id).then((user) => {
      res.status(200).json(user);
    });
  } else {
    throw new Error("Authorization header must be provided");
  }
});
router.put("/", (req, res) => {
  if (req.headers.authorization) {
    const user = checkAuth(req.headers.authorization);
    const name = req.body.name;
    const promise = users.updateName(user.user_id, name);
    promise.then((user) => {
      res.status(201).json(user);
    });
  } else {
    throw new Error("Authorization header must be provided");
  }
});

export default router;

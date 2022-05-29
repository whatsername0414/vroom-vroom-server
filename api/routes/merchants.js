import express from "express";
import checkAuth from "../utils/check-auth.js";
import repository from "../repository/merchants.js";

const router = express.Router();

router.post("/", (req, res) => {
  if (req.headers.authorization) {
    const merchant = req.body;
    repository
      .addMerchant(merchant)
      .then(res.status(201).json({ message: "merchant successfully created" }));
  } else {
    res.status(401).json({ message: "Authorization header must be provided" });
  }
});

router.get("/", (req, res) => {
  let user;
  let promise;
  if (req.headers.authorization) {
    user = checkAuth(req.headers.authorization);
  }
  const category = req.query.category;
  const searchTerm = req.query.searchTerm;
  if (category) {
    promise = repository.merchantsByCategory(
      user ? user.id : undefined,
      category
    );
  } else if (searchTerm) {
    promise = repository.merchantsSearch(
      user ? user.id : undefined,
      searchTerm
    );
  } else {
    promise = repository.merchants(user ? user.id : undefined);
  }
  promise.then((merchants) => {
    res.status(200).json(merchants);
  });
});

router.get("/favorites", (req, res) => {
  if (req.headers.authorization) {
    const user = checkAuth(req.headers.authorization);
    const promise = repository.favorite(user.id);
    promise.then((merchants) => {
      res.status(200).json(merchants);
    });
  } else {
    res
      .status(401)
      .json({ error_message: "Authorazation header must be provided" });
  }
});

router.put("/favorites", (req, res) => {
  if (req.headers.authorization) {
    const user = checkAuth(req.headers.authorization);
    const merchantId = req.body.merchantId;
    const direction = req.body.direction;
    if (direction === 1) {
      repository
        .addFavorite(merchantId, user.user_id)
        .then(
          res.status(201).json({ success: "Successfully added to favorites" })
        );
    } else {
      repository.removeFavorite(merchantId, user.user_id).then(res.status(204));
    }
  } else {
    res
      .status(401)
      .json({ error_message: "Authorazation header must be provided" });
  }
});
export default router;

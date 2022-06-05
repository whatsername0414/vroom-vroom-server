import express from "express";
import checkAuth from "../utils/check-auth.js";
import repository from "../repositories/orders.js";

const router = express.Router();

router.get("/", (req, res) => {
  if (req.headers.authorization) {
    const user = checkAuth(req.headers.authorization);
    const status = req.query.status;
    const promise = repository.orders(user.user_id, status);
    promise.then((orders) => {
      res.status(200).json({ data: orders });
    });
  } else {
    throw new Error("Authorization header must be provided");
  }
});

router
  .route("/:id")
  .get((req, res) => {
    if (req.headers.authorization) {
      const orderId = req.params.id;
      const promise = repository.order(orderId);
      promise.then((order) => {
        res.status(200).json(order);
      });
    } else {
      throw new Error("Authorization header must be provided");
    }
  })
  .post((req, res) => {
    if (req.headers.authorization) {
      const user = checkAuth(req.headers.authorization);
      const merchantId = req.body.merchantId;
      const payment = req.body.payment;
      const deliveryAddress = req.body.deliveryAddress;
      const orderDetail = req.body.orderDetail;
      const promise = repository.createOrder(
        user.user_id,
        merchantId,
        payment,
        deliveryAddress,
        orderDetail
      );
      promise.then((order) => {
        res.status(201).json(order);
      });
    } else {
      throw new Error("Authorization header must be provided");
    }
  })
  .put((req, res) => {
    if (req.headers.authorization) {
      const user = checkAuth(req.headers.authorization);
      const orderId = req.params.id;
      const newAddress = req.body.newAddress;
      const promise = repository.updateAddress(
        user.user_id,
        orderId,
        newAddress
      );
      promise.then(
        res
          .status(201)
          .json({ message: "Delivery address updated successfully" })
      );
    } else {
      throw new Error("Authorization header must be provided");
    }
  });

export default router;

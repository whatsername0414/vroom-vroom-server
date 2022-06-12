import Order from "../models/Order.js";
import Merchant from "../models/Merchant.js";
import checkAuth from "../utils/check-auth.js";

export const getOrders = async (req, res) => {
  const { status } = req.query;
  try {
    if (status) {
      const orders = await Order.find({ customer: req.userId, status: status })
        .populate("customer", { name: 1, phone: 1 })
        .populate("merchant", { _id: 1, name: 1 })
        .sort({ created_at: -1 });
      res.status(200).json({ data: orders });
    } else {
      const orders = await Order.find({ customer: req.userId })
        .populate("customer", { name: 1, phone: 1 })
        .populate("merchant", { _id: 1, name: 1 })
        .sort({ created_at: -1 });
      res.status(200).json({ data: orders });
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const getOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id)
      .populate("customer", { name: 1, phone: 1 })
      .populate("merchant", { _id: 1, name: 1 });
    res.status(200).json({ data: order });
  } catch (error) {
    throw new Error(error);
  }
};
export const createOrder = async (req, res) => {
  const { merchantId, payment, deliverAaddress, orderDetail } = req.body;
  try {
    const newOrder = new Order({
      customer: req.userId,
      merchant: merchantId,
      payment: payment,
      delivery_address: deliverAaddress,
      order_detail: orderDetail,
    });

    const order = await newOrder.save();
    res.status(200).json({ data: order });
  } catch (error) {
    throw new Error(error);
  }
};
export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const order = await Order.findById(id);
    if (order && order.status === "Pending") {
      order.status = "Cancelled";
      order.cancellation_reason = reason;
      await order.save();
      res.status(200).json({
        data: { message: "Order successfully cancelled" },
      });
    } else {
      res.status(404).json({
        data: { message: "Order does not exist or status was changed" },
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const updateOrderAddress = async (req, res) => {
  const { id } = req.params;
  const { newAddress } = req.body;
  try {
    const order = await Order.findOne({ customer: req.userId, _id: id });
    if (order && order.status === "Confirmed") {
      order.delivery_address = newAddress;
      await order.save();
      res.status(200).json({
        data: { message: "Order delivery address updated" },
      });
    } else {
      res.status(404).json({
        data: { message: "Order does not exist or status was changed" },
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const createReview = async (req, res) => {
  const { id } = req.params;
  const { merchantId, rate, comment } = req.body;
  try {
    const updatedMerchant = await Merchant.updateOne(
      { _id: Types.ObjectId(merchantId) },
      {
        $push: {
          reviews: {
            user_id: req.userId,
            rate: rate,
            _review: comment,
          },
        },
      },
      { new: true }
    );
    if (updatedMerchant.acknowledged === true) {
      const order = await Order.findById(id);
      if (order) {
        order.reviewed = true;
        await order.save();
        res.status(201).json({
          data: { message: "Your review was created" },
        });
      } else {
        res.status(404).json({
          data: { message: "Order does not exist" },
        });
      }
    } else {
      res.status(500).json({
        data: { message: "Unable to complete operation" },
      });
    }
  } catch (error) {
    throw new Error("Unable to add review");
  }
};

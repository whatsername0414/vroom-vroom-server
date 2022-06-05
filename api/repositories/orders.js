import Order from "../models/Order.js";
import mongoose from "mongoose";

const order = {
  orders: async (userId, status = undefined) => {
    try {
      if (status) {
        const orders = await Order.find({ customer: userId, status: status })
          .populate("customer", { name: 1, phone: 1 })
          .populate("merchant", { _id: 1, name: 1 })
          .sort({ created_at: -1 });
        return orders;
      }
      const orders = await Order.find({ customer: userId })
        .populate("customer", { name: 1, phone: 1 })
        .populate("merchant", { _id: 1, name: 1 })
        .sort({ created_at: -1 });
      return orders;
    } catch (error) {
      throw new Error(error);
    }
  },
  order: async (orderId) => {
    try {
      const order = await Order.findById(orderId)
        .populate("customer")
        .populate("merchant");
      return order;
    } catch (error) {
      throw new Error(error);
    }
  },
  createOrder: async (
    userId,
    merchantId,
    payment,
    delivery_address,
    order_detail
  ) => {
    try {
      const newOrder = new Order({
        customer: userId,
        merchant: merchantId,
        payment: payment,
        delivery_address: delivery_address,
        order_detail: order_detail,
      });

      const order = await newOrder.save();
      return order;
    } catch (error) {
      throw new Error(error);
    }
  },
  updateAddress: async (userId, orderId, newAddress) => {
    try {
      const order = await Order.findOne({ customer: userId, _id: orderId });
      if (order && order.status === "Confirmed") {
        order.delivery_address = newAddress;
        await order.save();
        return "Success";
      } else {
        throw new Error("Order does not exist or status changed");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default order;

import Order from '../models/Order.js';
import Merchant from '../models/mechant/Merchant.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import {
  CUSTOMER,
  RIDER,
  PENDING,
  CONFIRMED,
  ACCEPTED,
  PURCHASED,
  ARRIVED,
  DELIVERED,
  CANCELLED,
  PENDING_NAME,
  CONFIRMED_NAME,
  ACCEPTED_NAME,
  PURCHASED_NAME,
  ARRIVED_NAME,
  DELIVERED_NAME,
  CANCELLED_NAME,
  CASH_ON_DELIVERY,
} from '../utils/constrants.js';
import { getMessaging } from '../utils/messaging.js';
import dotenv from 'dotenv';

dotenv.config();

export const getOrders = async (req, res) => {
  const { type, status } = req?.query;
  let query =
    type === CUSTOMER
      ? { customer: req.userId, 'status.ordinal': status }
      : type === RIDER || status == PENDING
      ? { 'status.ordinal': status }
      : { $unwind: { path: '$orders', preserveNullAndEmptyArrays: true } };
  try {
    const orders = await Order.find(query)
      .populate('customer', { name: 1, phone: 1 })
      .populate('merchant', { _id: 1, name: 1, location: 1, img_url: 1 })
      .sort({ created_at: -1 });
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const getOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id)
      .populate('customer', { name: 1, phone: 1 })
      .populate('merchant', { _id: 1, name: 1, location: 1 });
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const createOrder = async (req, res) => {
  const { merchantId, payment, deliveryAddress, orderDetail } = req.body;
  try {
    const newOrder = new Order({
      customer: req.userId,
      merchant: merchantId,
      payment: payment,
      delivery_address: deliveryAddress,
      order_detail: orderDetail,
    });
    const order = await newOrder.save();
    res.status(201).json({ data: { orderId: order._id } });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const order = await Order.findById(id);
    if (order && order.status.ordinal === PENDING) {
      order.status.ordinal = CANCELLED;
      order.cancellation_reason = reason;
      await order.save();
      res.status(200).json({
        data: { message: 'Order successfully cancelled' },
      });
    } else {
      res.status(404).json({
        data: { message: 'Order does not exist or status was changed' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const confirmOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (order && order.status.ordinal == PENDING) {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            'status.ordinal': CONFIRMED,
            'status.label': CONFIRMED_NAME,
          },
        },
        { new: true }
      )
        .populate('customer', { name: 1, phone: 1, fcm_token: 1 })
        .populate('merchant', { _id: 1, name: 1, location: 1 });
      const message = {
        data: {
          title: 'Confirmed',
          body: 'You order has been confirmed!',
        },
        token: updatedOrder.customer.fcm_token,
      };
      getMessaging(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
      res.status(200).json({
        data: updatedOrder,
      });
    } else {
      res.status(404).json({
        data: { message: 'Order does not exist or status was changed' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
//TODO: Notify customer that rider has accepted the order
export const pickOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findById(id);
      if (order && order.status.ordinal == CONFIRMED) {
        const updatedOrder = await Order.findByIdAndUpdate(
          id,
          {
            $set: {
              'status.ordinal': ACCEPTED,
              'status.label': ACCEPTED_NAME,
              rider: req.userId,
            },
          },
          { new: true }
        )
          .populate('customer', { name: 1, phone: 1 })
          .populate('merchant', { _id: 1, name: 1, location: 1 });
        user.picked_order = updatedOrder._id;
        await user.save();
        res.status(200).json({
          data: updatedOrder,
        });
      } else {
        res.status(404).json({
          data: { message: 'Order does not exist or status was changed' },
        });
      }
    } else {
      res.status(401).json({
        data: { message: 'Invalid credentials' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const purchasedOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: { 'status.label': PURCHASED_NAME },
        },
        { new: true }
      )
        .populate('customer', { name: 1, phone: 1 })
        .populate('merchant', { _id: 1, name: 1, location: 1 });
      res.status(200).json({
        data: order,
      });
    } else {
      res.status(401).json({
        data: { message: 'Invalid credentials' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
//TODO: Notify customer that rider has arrived
export const arrived = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: { 'status.label': ARRIVED_NAME },
        },
        { new: true }
      )
        .populate('customer', { name: 1, phone: 1 })
        .populate('merchant', { _id: 1, name: 1, location: 1 });
      const message = {
        notification: {
          title: 'Arrived',
          body: 'The rider has arrived at your location!',
        },
        token: updatedOrder.customer.fcm_token,
      };
      getMessaging(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
      res.status(200).json({
        data: updatedOrder,
      });
      res.status(200).json({
        data: order,
      });
    } else {
      res.status(401).json({
        data: { message: 'Invalid credentials' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
//TODO: Notify order delivered
export const deliveredOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: { 'status.label': DELIVERED_NAME, 'status.ordinal': DELIVERED },
        },
        { new: true }
      )
        .populate('customer', { name: 1, phone: 1 })
        .populate('merchant', { _id: 1, name: 1, location: 1 });
      const message = {
        notification: {
          title: 'Delivered',
          body: 'Your order has been succefully delivered!',
        },
        token: updatedOrder.customer.fcm_token,
      };
      getMessaging(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
      res.status(200).json({
        data: updatedOrder,
      });
      res.status(200).json({
        data: order,
      });
      user.picked_order = null;
      await user.save();
    } else {
      res.status(401).json({
        data: { message: 'Invalid credentials' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const updateOrderAddress = async (req, res) => {
  const { id } = req.params;
  const { newAddress } = req.body;
  try {
    const order = await Order.findOne({ customer: req.userId, _id: id });
    if (order && order.status.ordinal === CONFIRMED) {
      order.delivery_address = newAddress;
      await order.save();
      res.status(200).json({
        data: { message: 'Order delivery address updated' },
      });
    } else {
      res.status(404).json({
        data: { message: 'Order does not exist or status was changed' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const createReview = async (req, res) => {
  const { id } = req.params;
  const { merchantId, rate, comment } = req.body;
  try {
    const updatedMerchant = await Merchant.updateOne(
      { _id: mongoose.Types.ObjectId(merchantId) },
      {
        $push: {
          reviews: {
            user: req.userId,
            rate: parseInt(rate),
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
          data: { message: 'Your review was created' },
        });
      } else {
        res.status(404).json({
          data: { message: 'Order does not exist' },
        });
      }
    } else {
      res.status(500).json({
        data: { message: 'Unable to add review' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const getDeliveryFee = async (req, res) => {
  const token = process.env.MAP_BOX_TOKEN;
  const { lng, lat, merchantId } = req.query;
  try {
    const merchant = await Merchant.findById(merchantId);
    const latMerchant = merchant.location[0];
    const lngMerchant = merchant.location[1];
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lng}%2C${lat}%3B${lngMerchant}%2C${latMerchant}?alternatives=true&geometries=geojson&language=en&overview=simplified&access_token=${token}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKM = Math.ceil(route.distance / 1000);
          if (distanceKM !== undefined) {
            if (distanceKM < 5) {
              res.status(200).json({ data: { deliveryFee: 49 } });
            } else {
              const additionalKM = distanceKM - 5;
              const deliveryFee = additionalKM * 7 + 49;
              res.status(200).json({ data: { deliveryFee: deliveryFee } });
            }
          } else {
            res
              .status(500)
              .json({ data: { message: 'Unable to calculate distance' } });
          }
        } else {
          res.status(500).json({
            data: { message: 'Unable to get distance' },
          });
        }
      })
      .catch(() => {
        res.status(500).json({
          data: { message: 'Unable to get distance' },
        });
      });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

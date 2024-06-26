import Order from '../models/Order.js';
import Merchant from '../models/Merchant.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import {
  CUSTOMER,
  RIDER,
  PENDING,
  CONFIRMED,
  ACCEPTED,
  PICKEDUP,
  DELIVERED,
  CANCELLED,
} from '../utils/constrants.js';
import { getMessaging } from '../utils/messaging.js';
import dotenv from 'dotenv';

dotenv.config();

export const getOrders = async (req, res) => {
  const { type, status } = req?.query;
  let query =
    type === CUSTOMER
      ? { customer: req.userId, status: status }
      : type === RIDER || status == PENDING
      ? { status: status }
      : { $unwind: { path: '$orders', preserveNullAndEmptyArrays: true } };
  try {
    const orders = await Order.find(query)
      .populate('customer')
      .populate('merchant', { product_sections: 0, reviews: 0, favorites: 0 })
      .populate('products.product', { option_sections: 0 })
      .populate('products.options')
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
      .populate('customer')
      .populate('merchant', { product_sections: 0, reviews: 0, favorites: 0 })
      .populate('products.product', { option_sections: 0 })
      .populate('products.options');
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const createOrder = async (req, res) => {
  const { merchant, address, products, deliveryFee, notes } = req.body;
  try {
    const newOrder = new Order({
      customer: req.userId,
      merchant: merchant,
      address: address,
      products: products,
      delivery_fee: deliveryFee,
      notes: notes,
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
    if (order && order.status === PENDING) {
      order.status = CANCELLED;
      order.cancellation_reason = reason;
      await order.save();
      res.status(200).json({
        data: { message: 'Order successfully cancelled' },
      });
    } else {
      res.status(404).json({
        data: { message: 'Order does not exist or already processed' },
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
    if (order && order.status == PENDING) {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            status: CONFIRMED,
          },
        },
        { new: true }
      )
        .populate('customer')
        .populate('merchant', { product_sections: 0, reviews: 0, favorites: 0 })
        .populate('products.product', { option_sections: 0 })
        .populate('products.options');
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

export const acceptOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findById(id);
      if (order && order.status == CONFIRMED) {
        const updatedOrder = await Order.findByIdAndUpdate(
          id,
          {
            $set: {
              status: ACCEPTED,
              rider: req.userId,
            },
          },
          { new: true }
        )
          .populate('customer')
          .populate('merchant', {
            product_sections: 0,
            reviews: 0,
            favorites: 0,
          })
          .populate('products.product', { option_sections: 0 })
          .populate('products.options');
        user.picked_order = updatedOrder._id;
        await user.save();
        const message = {
          data: {
            title: 'Accepted',
            body: 'You order has been accepted!',
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
export const pickedupOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: { status: PICKEDUP },
        },
        { new: true }
      )
        .populate('customer')
        .populate('merchant', { product_sections: 0, reviews: 0, favorites: 0 })
        .populate('products.product', { option_sections: 0 })
        .populate('products.options');
      const message = {
        notification: {
          title: 'Picked Up',
          body: 'Your order has been picked up!',
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
export const deliveredOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (user && user.type == RIDER) {
      const order = await Order.findByIdAndUpdate(
        id,
        {
          $set: { status: DELIVERED },
        },
        { new: true }
      )
        .populate('customer')
        .populate('merchant', { product_sections: 0, reviews: 0, favorites: 0 })
        .populate('products.product', { option_sections: 0 })
        .populate('products.options');
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
    if (order && order.status === CONFIRMED) {
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

import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { PENDING_NAME, REJECTED_NAME } from '../utils/constrants.js';

export const getPayments = async (_, res) => {
  try {
    const payments = await Payment.find().populate('sender', {
      _id: 1,
      name: 1,
    });
    res.status(200).json({ data: payments });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const createPayment = async (req, res) => {
  try {
    const payment = new Payment({ ...req.body, sender: req.userId });
    const savedPayment = await payment.save();
    const user = await User.findById(req.userId);
    if (user) {
      user.pending_payment = savedPayment._id;
      await user.save();
      res.status(201).json({ data: savedPayment });
    } else {
      res.status(404).json({
        data: { message: 'User does not exist' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { status, balance } = req.body;
  try {
    const payment = await Payment.findById(id);
    if (payment && payment.status === PENDING_NAME) {
      payment.status = status;
      payment.balance = balance;
      const savedPayment = await payment.save();
      res.status(200).json({ data: savedPayment });
    } else {
      res.status(404).json({
        data: { message: 'Payment does not exist or status was changed' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const verifyPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payment.findById(id);
    if (payment) {
      if (payment.status === REJECTED_NAME) {
        res.status(406).json({
          data: { message: 'Incorrect reference ID' },
        });
      } else {
        const user = await User.findById(req.userId);
        if (user) {
          user.pending_payment = null;
          await user.save();
          res.status(200).json({ data: payment });
        } else {
          res.status(404).json({
            data: { message: 'User does not exist' },
          });
        }
      }
    } else {
      res.status(404).json({
        data: { message: 'Payment does not exist' },
      });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

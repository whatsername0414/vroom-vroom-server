import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Otp from '../models/Otp.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.PASSWORD,
  },
});

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    SECRET_KEY
  );
}
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    const match = await bcrypt.compare(password, admin ? admin.password : '');
    if (admin && match) {
      const data = {
        ...admin._doc,
        token: generateToken(admin),
      };
      res.status(200).json({ data: data });
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
export const registerAdmin = async (req, res) => {
  const { name, username, password, emailAddress, code } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (admin) {
      res.status(401).json({
        data: { message: 'Username already exist' },
      });
    } else {
      const otps = await Otp.find({ user: emailAddress });
      if (otps.length > 0) {
        const currentOtp = otps[otps.length - 1];
        if (currentOtp.otp === code) {
          const hash = await bcrypt.hash(password, 10);
          const admin = new Admin({
            name: name,
            username: username,
            password: hash,
          });
          const savedAdmin = await admin.save();
          const data = {
            ...savedAdmin._doc,
            token: generateToken(savedAdmin),
          };
          res.status(200).json({ data: data });
        } else {
          res
            .status(400)
            .json({ data: { message: 'You have entered an invalid code' } });
        }
      } else {
        res.status(404).json({ data: { message: 'Code not found' } });
      }
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const register = async (req, res) => {
  const { fcmToken, type } = req.body;
  try {
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      if (user?.type != type) {
        res.status(409).json({
          data: {
            message: `You cannot sign in as ${type} because your email is registered as ${user.type}.`,
          },
        });
      } else {
        user.fcm_token = fcmToken;
        await user.save();
        res.status(200).json({ data: user });
      }
    } else {
      const newUser = new User({
        user_id: req.userId,
        name: req.name,
        email: req.email,
        fcm_token: fcmToken,
      });
      const savedUser = await newUser.save();
      res.status(200).json({ data: savedUser });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const registerRider = async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(401).json({
        data: { message: 'user already exist' },
      });
    } else {
      const newUser = new User({
        name: name,
        email: req.email,
        phone: {
          verify: true,
          number: phone,
        },
      });
      const savedUser = await newUser.save();
      res.status(200).json({ data: savedUser });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const generateEmailOtp = async (req, res) => {
  const { emailAddress, isAdmin } = req.body;
  try {
    const user = await User.findOne({ email: emailAddress });
    if (user && !isAdmin) {
      res
        .status(409)
        .json({ data: { message: 'Email address already exist' } });
      return;
    }
    const code = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const options = {
      from: 'vroomvroom.android@outlook.com',
      to: emailAddress,
      subject: 'VroomVroom Verification Code',
      text: `Thanks for verifying your ${emailAddress} account. Your code is: ${code}`,
    };
    transporter.sendMail(options, (error, _) => {
      if (error) {
        res.status(500).json({ data: { message: 'Something went wrong' } });
        return;
      }
    });
    const otp = new Otp({
      user: emailAddress,
      receiver: emailAddress,
      otp: code,
    });
    await otp.save();
    res.status(200).json({ data: { message: 'OTP sent' } });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

export const vertifyEmailOtp = async (req, res) => {
  const { emailAddress, otp } = req.body;
  try {
    const otps = await Otp.find({ user: emailAddress });
    if (otps.length > 0) {
      const currentOtp = otps[otps.length - 1];
      if (currentOtp.otp === otp) {
        res.status(200).json({
          data: {
            message: 'You have successfully verified your email address',
          },
        });
      } else {
        res
          .status(400)
          .json({ data: { message: 'You have entered an invalid code' } });
      }
    } else {
      res.status(404).json({ data: { message: 'OTP not found' } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

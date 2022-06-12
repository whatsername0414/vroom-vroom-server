import User from "../models/User.js";
import Otp from "../models/Otp.js";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const getUser = async (req, res) => {
  const authorization = req.headers.authorization;
  const userId = checkAuth(req.headers.authorization)?.sub;
  if (authorization && userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        res.status(200).json({ data: user });
      } else {
        res.status(404).json({ data: { message: "User does not exist" } });
      }
    } catch (error) {
      throw new Error(error);
    }
  } else {
    res
      .status(401)
      .json({ data: { message: "Authorization header must be provided" } });
  }
};
export const register = async (req, res) => {
  const authorization = req.headers.authorization;
  const userId = checkAuth(req.headers.authorization)?.sub;
  const { name, email, pushToken, location } = req.body;
  if (authorization && userId) {
    try {
      const user = User.findById(userId);
      if (!user) {
        const newUser = new User({
          _id: userId,
          name: name,
          email: email,
          push_token: pushToken,
          location: location,
        });
        const savedUser = await newUser.save();
        res.status(200).json({ data: savedUser });
      } else {
        res.status(200).json({ data: user });
      }
    } catch (error) {
      throw new Error(error);
    }
  } else {
    res
      .status(401)
      .json({ data: { message: "Authorization header must be provided" } });
  }
};
export const updateName = async (req, res) => {
  const authorization = req.headers.authorization;
  const userId = checkAuth(req.headers.authorization)?.sub;
  const { name } = req.body;
  if (authorization && userId) {
    try {
      const user = User.findById(userId);
      if (user) {
        user.name = name;
        const savedUser = await user.save();
        res.status(200).json({ data: savedUser });
      } else {
        res.status(404).json({ data: { message: "User does not exist" } });
      }
    } catch (error) {
      throw new Error(error);
    }
  } else {
    res
      .status(401)
      .json({ data: { message: "Authorization header must be provided" } });
  }
};
export const updateAddress = async (req, res) => {
  const { address, city, additionalInfo, coordinates } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.location.address = address;
      user.location.city = city;
      user.location.additional_information = additionalInfo;
      user.location.coordinates = coordinates;
      const updatedUser = await user.save();
      res.status(200).json({ data: updatedUser });
    } else {
      res.status(404).json({ data: { message: "User does not exist" } });
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const registerPhoneNumber = async (req, res) => {
  const { number } = req.body;
  try {
    const generatedOtp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    client.messages.create({
      body: `Verification code: ${generatedOtp}`,
      from: TWILIO_PHONE_NUMBER,
      to: number,
    });
    res.status(201).json({ data: { message: "OTP sent" } });
  } catch (error) {
    throw new Error(error);
  }
};
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.userId);
    const queryOtp = await Otp.find({ user: user?._id });
    if (user && queryOtp.length > 0) {
      const currentOtp = queryOtp[queryOtp.length - 1];
      if (currentOtp.otp === otp) {
        user.phone.number = currentOtp.number;
        user.phone.verified = true;
        const updatedUser = await user.save();
        await Otp.deleteMany({ user: req.userId });
        return updatedUser;
      } else {
        res.status(400).json({ data: { message: "Invalid OTP" } });
      }
    } else {
      res.status(404).json({ data: { message: "OTP not found" } });
    }
  } catch (error) {
    throw new Error(error);
  }
};

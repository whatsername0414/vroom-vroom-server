import User from "../models/User.js";
import Otp from "../models/Otp.js";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const getUsers = async (req, res) => {
  const { type } = req.params;
  try {
    const users = await User.find({ type: type });
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      res.status(200).json({ data: user });
    } else {
      res.status(404).json({ data: { message: "User does not exist" } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const updateName = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.name = name;
      const savedUser = await user.save();
      res.status(200).json({ data: savedUser });
    } else {
      res.status(404).json({ data: { message: "User does not exist" } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
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
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const generatePhoneOtp = async (req, res) => {
  const { number } = req.body;
  try {
    const generatedOtp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    client.messages.create(
      {
        body: `Verification code: ${generatedOtp}`,
        from: TWILIO_PHONE_NUMBER,
        to: number,
      },
      (error) => console.log(error)
    );
    const otp = new Otp({
      user: req.userId,
      number: number,
      otp: generatedOtp,
    });
    await otp.save();
    res.status(201).json({ data: { message: "OTP sent" } });
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};
export const verifyPhoneOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.userId);
    const otps = await Otp.find({ user: user?._id });
    if (user && otps.length > 0) {
      const currentOtp = otps[otps.length - 1];
      if (currentOtp.otp === otp) {
        user.phone.number = currentOtp.number;
        user.phone.verified = true;
        const savedUser = await user.save();
        await Otp.deleteMany({ user: req.userId });
        res.status(201).json({ data: savedUser });
      } else {
        res
          .status(400)
          .json({ data: { message: "You have entered an invalid code" } });
      }
    } else {
      res.status(404).json({ data: { message: "OTP not found" } });
    }
  } catch (error) {
    res.status(500).json({
      data: { message: error.message },
    });
  }
};

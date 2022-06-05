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

const users = {
  user: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        return user;
      } else {
        throw new Error("User does not exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  updateName: async (userId, name) => {
    try {
      const user = User.findById(userId);
      if (user) {
        user.name = name;
        const updatedUser = await user.save();
        return updatedUser;
      } else {
        throw new Error("User does not exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  updateAddress: async (userId, address, city, additionalInfo, coordinates) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.location.address = address;
        user.location.city = city;
        user.location.additional_information = additionalInfo;
        user.location.coordinates = coordinates;
        const updatedUser = await user.save();
        return updatedUser;
      } else {
        throw new Error("User does not exists");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  registerMobileNumber: async (number) => {
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
      return "OTP is generated.";
    } catch (error) {
      throw new Error(error);
    }
  },
  verifyOtp: async (userId, otp) => {
    try {
      const user = await User.findById(userId);
      const queryOtp = await Otp.find({ user: user._id });
      if (user && queryOtp.length > 0) {
        const currentOtp = queryOtp[queryOtp.length - 1];
        if (currentOtp.otp === otp) {
          user.phone.number = currentOtp.number;
          user.phone.verified = true;
          const updatedUser = await user.save();
          await Otp.deleteMany({ user: userId });
          return updatedUser;
        } else {
          throw new UserInputError("Invalid OTP");
        }
      } else {
        throw new Error("OTP not found");
      }
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default users;

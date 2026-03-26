import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const registerService = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const role = email.toLowerCase().includes("admin") ? "admin" : "user";
  const user = await User.create({ name, email, password: hashed, role });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    baseCurrency: user.baseCurrency || "INR",
    token: generateToken(user._id),
  };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    baseCurrency: user.baseCurrency || "INR",
    token: generateToken(user._id),
  };
};

export const meService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  return user;
};

export const updateProfileService = async (userId, body) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (body.name) user.name = body.name;
  if (body.baseCurrency) user.baseCurrency = body.baseCurrency;
  if (body.email) {
    const exists = await User.findOne({ email: body.email, _id: { $ne: userId } });
    if (exists) throw new Error("Email already in use");
    user.email = body.email;
  }

  await user.save();
  return { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || "", baseCurrency: user.baseCurrency || "INR" };
};

export const changePasswordService = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: "Password changed successfully" };
};

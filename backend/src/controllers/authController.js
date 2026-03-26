import asyncHandler from "express-async-handler";
import { loginService, registerService, meService, updateProfileService, changePasswordService } from "../services/authService.js";
import { createSession, logActivity } from "../services/securityService.js";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = asyncHandler(async (req, res) => {
  const data = await registerService(req.body);
  try {
    await createSession(data._id, req);
    await logActivity(data._id, { action: "Account Created", detail: "New account registered", type: "auth", req });
  } catch (e) { /* non-critical */ }
  res.status(201).json(data);
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const data = await loginService(req.body);
    try {
      await createSession(data._id, req);
      await logActivity(data._id, { action: "Login", detail: `Logged in successfully`, type: "auth", req });
    } catch (e) { /* non-critical */ }
    res.json(data);
  } catch (error) {
    if (error.message === "Invalid credentials") {
      res.status(401);
    }
    throw error;
  }
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await meService(req.user._id);
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body);
  res.json(user);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  ).select("-password");

  res.json({ avatar: user.avatar, user });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error("No Google credential provided");
  }

  // Verify Google token
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;

  // Check if user already exists
  let user = await User.findOne({ email });

  if (user) {
    // Existing user — log them in
    if (picture && !user.avatar) {
      user.avatar = picture;
      await user.save();
    }
  } else {
    // New user — auto-register with random password
    const randomPassword = googleId + Date.now().toString(36);
    const bcrypt = await import("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(randomPassword, salt);

    user = await User.create({
      name: name || "Google User",
      email,
      password: hashed,
      avatar: picture || "",
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
    baseCurrency: user.baseCurrency || "INR",
    token: generateToken(user._id),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }
  const result = await changePasswordService(req.user._id, { currentPassword, newPassword });
  res.json(result);
});

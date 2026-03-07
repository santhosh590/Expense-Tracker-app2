import asyncHandler from "express-async-handler";
import { loginService, registerService, meService } from "../services/authService.js";

export const registerUser = asyncHandler(async (req, res) => {
  const data = await registerService(req.body);
  res.status(201).json(data);
});

export const loginUser = asyncHandler(async (req, res) => {
  const data = await loginService(req.body);
  res.json(data);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await meService(req.user._id);
  res.json(user);
});

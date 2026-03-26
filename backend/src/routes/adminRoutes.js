import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// Get all users
router.get("/users", protect, admin, asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
}));

// Delete user
router.delete("/users/:id", protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
}));

export default router;

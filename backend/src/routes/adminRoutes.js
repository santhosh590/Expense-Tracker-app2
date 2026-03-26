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

// Update user
router.put("/users/:id", protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    
    // Prevent removing your own admin status accidentally
    if (req.user._id.toString() === user._id.toString() && req.body.role !== "admin") {
      res.status(400);
      throw new Error("You cannot strip your own admin privileges.");
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
}));

export default router;

import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import SavingsGoal from "../models/SavingsGoal.js";

const router = express.Router();

// Get all goals
router.get("/", protect, asyncHandler(async (req, res) => {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
}));

// Create goal
router.post("/", protect, asyncHandler(async (req, res) => {
    const goal = await SavingsGoal.create({ ...req.body, userId: req.user._id });
    res.status(201).json(goal);
}));

// Update goal (add savings, edit details)
router.put("/:id", protect, asyncHandler(async (req, res) => {
    const goal = await SavingsGoal.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
    );
    if (!goal) { res.status(404); throw new Error("Goal not found"); }
    res.json(goal);
}));

// Delete goal
router.delete("/:id", protect, asyncHandler(async (req, res) => {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) { res.status(404); throw new Error("Goal not found"); }
    res.json({ message: "Goal deleted" });
}));

export default router;

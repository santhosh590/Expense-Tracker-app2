import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import SplitExpense from "../models/SplitExpense.js";

const router = express.Router();

router.get("/", protect, asyncHandler(async (req, res) => {
    const splits = await SplitExpense.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(splits);
}));

router.post("/", protect, asyncHandler(async (req, res) => {
    const split = await SplitExpense.create({ ...req.body, userId: req.user._id });
    res.status(201).json(split);
}));

router.put("/:id", protect, asyncHandler(async (req, res) => {
    const split = await SplitExpense.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
    );
    if (!split) { res.status(404); throw new Error("Split not found"); }
    res.json(split);
}));

// Toggle participant settled
router.patch("/:id/settle/:participantId", protect, asyncHandler(async (req, res) => {
    const split = await SplitExpense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!split) { res.status(404); throw new Error("Split not found"); }

    const participant = split.participants.id(req.params.participantId);
    if (!participant) { res.status(404); throw new Error("Participant not found"); }

    participant.settled = !participant.settled;
    await split.save();
    res.json(split);
}));

router.delete("/:id", protect, asyncHandler(async (req, res) => {
    const split = await SplitExpense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!split) { res.status(404); throw new Error("Split not found"); }
    res.json({ message: "Split deleted" });
}));

export default router;

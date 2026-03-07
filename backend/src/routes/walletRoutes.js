import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

router.get("/", protect, asyncHandler(async (req, res) => {
    const wallets = await Wallet.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(wallets);
}));

router.post("/", protect, asyncHandler(async (req, res) => {
    const wallet = await Wallet.create({ ...req.body, userId: req.user._id });
    res.status(201).json(wallet);
}));

router.put("/:id", protect, asyncHandler(async (req, res) => {
    const wallet = await Wallet.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
    );
    if (!wallet) { res.status(404); throw new Error("Wallet not found"); }
    res.json(wallet);
}));

router.delete("/:id", protect, asyncHandler(async (req, res) => {
    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!wallet) { res.status(404); throw new Error("Wallet not found"); }
    res.json({ message: "Wallet deleted" });
}));

export default router;

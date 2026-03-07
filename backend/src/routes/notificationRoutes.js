import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();
router.use(protect);

// Get notifications
router.get("/", asyncHandler(async (req, res) => {
    const { unreadOnly } = req.query;
    const query = { userId: req.user._id };
    if (unreadOnly === "true") query.isRead = false;
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
}));

// Mark as read
router.put("/:id/read", asyncHandler(async (req, res) => {
    const notif = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true },
        { new: true }
    );
    res.json(notif);
}));

// Mark all as read
router.put("/read-all", asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
    );
    res.json({ message: "All marked as read" });
}));

// Delete notification
router.delete("/:id", asyncHandler(async (req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Deleted" });
}));

// Clear all
router.delete("/", asyncHandler(async (req, res) => {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: "All cleared" });
}));

export default router;

import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Category from "../models/Category.js";

const router = express.Router();
router.use(protect);

// Get all categories for user (including defaults)
router.get("/", asyncHandler(async (req, res) => {
    let categories = await Category.find({ userId: req.user._id }).sort({ name: 1 });

    // Seed defaults if empty
    if (categories.length === 0) {
        const defaults = [
            { name: "Food", icon: "🍔", color: "#f59e0b", type: "expense", isDefault: true },
            { name: "Transport", icon: "🚗", color: "#3b82f6", type: "expense", isDefault: true },
            { name: "Shopping", icon: "🛍️", color: "#ec4899", type: "expense", isDefault: true },
            { name: "Entertainment", icon: "🎮", color: "#8b5cf6", type: "expense", isDefault: true },
            { name: "Utilities", icon: "💡", color: "#6366f1", type: "expense", isDefault: true },
            { name: "Healthcare", icon: "🏥", color: "#ef4444", type: "expense", isDefault: true },
            { name: "Education", icon: "📚", color: "#14b8a6", type: "expense", isDefault: true },
            { name: "Groceries", icon: "🛒", color: "#22c55e", type: "expense", isDefault: true },
            { name: "Insurance", icon: "🛡️", color: "#f97316", type: "expense", isDefault: true },
            { name: "Rent", icon: "🏠", color: "#a855f7", type: "expense", isDefault: true },
            { name: "Salary", icon: "💰", color: "#22c55e", type: "income", isDefault: true },
            { name: "Freelance", icon: "💼", color: "#6366f1", type: "income", isDefault: true },
            { name: "Investment", icon: "📈", color: "#3b82f6", type: "income", isDefault: true },
            { name: "Gift", icon: "🎁", color: "#ec4899", type: "income", isDefault: true },
            { name: "Recharge", icon: "📱", color: "#f59e0b", type: "expense", isDefault: true },
            { name: "Other", icon: "📁", color: "#6b7280", type: "both", isDefault: true },
        ];
        const created = await Category.insertMany(
            defaults.map(d => ({ ...d, userId: req.user._id }))
        );
        categories = created;
    }

    res.json(categories);
}));

// Add custom category
router.post("/", asyncHandler(async (req, res) => {
    const { name, icon, color, type } = req.body;
    if (!name) { res.status(400); throw new Error("Name is required"); }

    const exists = await Category.findOne({ userId: req.user._id, name });
    if (exists) { res.status(400); throw new Error("Category already exists"); }

    const cat = await Category.create({ userId: req.user._id, name, icon, color, type });
    res.status(201).json(cat);
}));

// Update category
router.put("/:id", asyncHandler(async (req, res) => {
    const cat = await Category.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
    );
    if (!cat) { res.status(404); throw new Error("Not found"); }
    res.json(cat);
}));

// Delete category
router.delete("/:id", asyncHandler(async (req, res) => {
    const cat = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cat) { res.status(404); throw new Error("Not found"); }
    if (cat.isDefault) { res.status(400); throw new Error("Cannot delete default category"); }
    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: "Deleted" });
}));

export default router;

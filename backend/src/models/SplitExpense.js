import mongoose from "mongoose";

const splitExpenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true, trim: true },
        totalAmount: { type: Number, required: true },
        paidBy: { type: String, required: true },
        participants: [
            {
                name: { type: String, required: true },
                share: { type: Number, required: true },
                settled: { type: Boolean, default: false },
            },
        ],
        items: [
            {
                name: { type: String, required: true },
                amount: { type: Number, required: true },
            },
        ],
        date: { type: Date, default: Date.now },
        category: { type: String, default: "Other" },
    },
    { timestamps: true }
);

export default mongoose.model("SplitExpense", splitExpenseSchema);

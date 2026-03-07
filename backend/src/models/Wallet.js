import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true, trim: true },
        balance: { type: Number, default: 0 },
        type: {
            type: String,
            enum: ["cash", "bank", "upi", "credit_card", "other"],
            default: "cash",
        },
        icon: { type: String, default: "💰" },
        color: { type: String, default: "#6366f1" },
    },
    { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);

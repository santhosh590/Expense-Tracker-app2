import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: { type: String, required: true },
        detail: { type: String, default: "" },
        type: {
            type: String,
            enum: ["auth", "transaction", "profile", "data", "security"],
            default: "auth",
        },
        ip: { type: String, default: "" },
        device: { type: String, default: "" },
    },
    { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);

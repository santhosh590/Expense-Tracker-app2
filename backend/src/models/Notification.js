import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["bill_due", "budget_alert", "goal_reached", "recurring", "system", "insight"],
            default: "system",
        },
        isRead: { type: Boolean, default: false },
        actionUrl: { type: String, default: "" },
        relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        device: { type: String, default: "Unknown Device" },
        browser: { type: String, default: "Unknown Browser" },
        os: { type: String, default: "Unknown OS" },
        ip: { type: String, default: "" },
        location: { type: String, default: "Unknown" },
        lastActive: { type: Date, default: Date.now },
        tokenHash: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

sessionSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model("Session", sessionSchema);

import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true, trim: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ["income", "expense"], required: true },
        category: { type: String, required: true },
        frequency: {
            type: String,
            enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"],
            required: true,
        },
        nextDueDate: { type: Date, required: true },
        lastProcessed: { type: Date, default: null },
        isActive: { type: Boolean, default: true },
        notes: { type: String, default: "" },
        tags: [{ type: String, trim: true }],
        // Bill reminder specific
        isBillReminder: { type: Boolean, default: false },
        reminderDaysBefore: { type: Number, default: 3 },
        isPaid: { type: Boolean, default: false },
        payee: { type: String, default: "" },
    },
    { timestamps: true }
);

recurringSchema.index({ userId: 1, isActive: 1, nextDueDate: 1 });

export default mongoose.model("Recurring", recurringSchema);

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import savingsRoutes from "./routes/savingsRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import splitRoutes from "./routes/splitRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// Serve uploaded avatars
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend Running...");
});

import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/splits", splitRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/insights", insightsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

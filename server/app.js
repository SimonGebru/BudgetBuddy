import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import BudgetPlan from "./routes/budgetRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes (API)
app.use("/auth", authRoutes);
app.use("/dev", devRoutes);

// Transactions (CRUD)
app.use("/transactions", transactionRoutes);
app.use("/budget", BudgetPlan);

// 404 fallback 
app.use((req, res) => {
  res.status(404).json({
    error: "NotFound",
    message: "Route not found",
  });
});

export default app;
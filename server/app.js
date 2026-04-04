import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import householdRoutes from "./routes/householdRoutes.js";
import personalBudgetRoutes from "./routes/personalBudgetRoutes.js";

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://budget-buddy-five-plum.vercel.app",
  "https://budgify.se",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/dev", devRoutes);

// Feature routes
app.use("/transactions", transactionRoutes);
app.use("/budget", budgetRoutes);
app.use("/household", householdRoutes);
app.use("/personal-budget", personalBudgetRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    error: "NotFound",
    message: "Route not found",
  });
});

export default app;
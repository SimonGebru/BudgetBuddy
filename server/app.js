import express from "express";
import cors from "cors";

import User from "./models/User.js";
import Household from "./models/Household.js";
import Transaction from "./models/Transaction.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * DEV ONLY – seed route
 * Används endast för att verifiera att modellerna fungerar
 */
app.post("/dev/seed", async (req, res) => {
  try {
    // 1) Skapa hushåll
    const household = await Household.create({
      name: "Test Household",
      members: [],
    });

    // 2) Skapa user (dummy passwordHash)
    const user = await User.create({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      passwordHash: "dummyhash",
      householdId: household._id,
    });

    // 3) Lägg user som medlem i hushållet
    household.members.push({
      userId: user._id,
      monthlyIncome: 25000,
    });
    await household.save();

    // 4) Skapa transaktion
    const transaction = await Transaction.create({
      householdId: household._id,
      createdBy: user._id,
      type: "expense",
      amount: 249,
      category: "Mat",
      date: new Date(),
      note: "Seed test",
    });

    res.status(201).json({
      household,
      user,
      transaction,
    });
  } catch (err) {
    res.status(500).json({
      error: "SeedError",
      message: err.message,
    });
  }
});


app.use((req, res) => {
  res.status(404).json({
    error: "NotFound",
    message: "Route not found",
  });
});

export default app;
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import Household from "../models/Household.js";
import User from "../models/User.js";

const router = Router();


router.use(requireAuth);

/**
 * POST /dev/household/create
 * Skapar ett hushåll och kopplar inloggad user till det
 */
router.post("/household/create", async (req, res) => {
  try {
    const { name, monthlyIncome } = req.body;

    const household = await Household.create({
      name: name || "My Household",
      members: [{ userId: req.user._id, monthlyIncome: Number(monthlyIncome) || 0 }],
    });

    await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

    res.status(201).json({
      message: "Household created and user connected",
      householdId: household._id,
    });
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
});

export default router;
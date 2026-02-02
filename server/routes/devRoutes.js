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

router.post("/household/join", async (req, res) => {
  try {
    const { householdId, monthlyIncome } = req.body;

    if (!householdId) {
      return res.status(400).json({
        error: "ValidationError",
        message: "householdId is required",
      });
    }

    const incomeNumber = Number(monthlyIncome);
    if (!Number.isFinite(incomeNumber) || incomeNumber < 0) {
      return res.status(400).json({
        error: "ValidationError",
        message: "monthlyIncome must be a number >= 0",
      });
    }

    const household = await Household.findById(householdId);
    if (!household) {
      return res.status(404).json({
        error: "NotFound",
        message: "Household not found",
      });
    }

    // 1) Om user redan är medlem → uppdatera income
    const existingMember = household.members.find(
      (m) => String(m.userId) === String(req.user._id)
    );

    if (existingMember) {
      existingMember.monthlyIncome = incomeNumber;
      await household.save();

      await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

      return res.status(200).json({
        message: "Already member. Income updated and user connected.",
        householdId: household._id,
      });
    }

    // 2) Lägg till user som ny medlem
    household.members.push({
      userId: req.user._id,
      monthlyIncome: incomeNumber,
    });
    await household.save();

    // 3) Sätt user.householdId
    await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

    res.status(200).json({
      message: "User joined household",
      householdId: household._id,
    });
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
});

export default router;
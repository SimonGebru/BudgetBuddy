import Household from "../models/Household.js";
import User from "../models/User.js";

/**
 * POST /household/create
 * Skapar ett hushåll och kopplar inloggad user till det
 */
export async function createHousehold(req, res) {
  try {
    const { name, monthlyIncome } = req.body;

    const incomeNumber = Number(monthlyIncome) || 0;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const household = await Household.create({
      name: name || "My Household",
      members: [
        {
          userId: req.user._id,
          monthlyIncome: incomeNumber,
          incomeHistory: [
            {
              month: currentMonth,
              amount: incomeNumber,
            },
          ],
        },
      ],
    });

    // När hushållet skapats kopplas även användaren till hushållet via user-dokumentet.
    await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

    return res.status(201).json({
      message: "Household created and user connected",
      householdId: household._id,
    });
  } catch (err) {
    return res.status(500).json({ error: "ServerError", message: err.message });
  }
}

/**
 * POST /household/join
 * Låter inloggad user gå med i ett befintligt hushåll
 */
export async function joinHousehold(req, res) {
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

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Om user redan är medlem → uppdatera income
    const existingMember = household.members.find(
      (m) => String(m.userId) === String(req.user._id)
    );

    if (existingMember) {
      existingMember.monthlyIncome = incomeNumber;

      const existingIncomeEntry = existingMember.incomeHistory?.find(
        (entry) => entry.month === currentMonth
      );

      // Om det redan finns en inkomstpost för månaden uppdateras den,
      // annars läggs en ny post till i historiken.
      if (existingIncomeEntry) {
        existingIncomeEntry.amount = incomeNumber;
      } else {
        existingMember.incomeHistory.push({
          month: currentMonth,
          amount: incomeNumber,
        });
      }

      await household.save();

      // Ser till att användaren också är kopplad till hushållet i User-modellen.
      await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

      return res.status(200).json({
        message: "Already member. Income updated and user connected.",
        householdId: household._id,
      });
    }

    // Lägg till user som ny medlem
    household.members.push({
      userId: req.user._id,
      monthlyIncome: incomeNumber,
      incomeHistory: [
        {
          month: currentMonth,
          amount: incomeNumber,
        },
      ],
    });
    await household.save();

    // Sätt user.householdId
    await User.findByIdAndUpdate(req.user._id, { householdId: household._id });

    return res.status(200).json({
      message: "User joined household",
      householdId: household._id,
    });
  } catch (err) {
    return res.status(500).json({ error: "ServerError", message: err.message });
  }
}

export async function getMyHousehold(req, res) {
  try {
    if (!req.user.householdId) {
      return res.status(404).json({
        error: "NotFound",
        message: "User is not connected to a household",
      });
    }

    const household = await Household.findById(req.user.householdId)
      .populate("members.userId", "name email")
      .exec();

    if (!household) {
      return res.status(404).json({
        error: "NotFound",
        message: "Household not found",
      });
    }

    // Här formar jag om svaret lite så att frontend får en renare och mer användbar struktur.
    return res.status(200).json({
      household: {
        id: household._id,
        name: household.name,
        members: household.members.map((member) => ({
          userId: member.userId?._id,
          name: member.userId?.name || "Unknown",
          email: member.userId?.email || "",
          monthlyIncome: member.monthlyIncome,
          incomeHistory: member.incomeHistory || [],
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * PATCH /household/income
 * Uppdaterar inloggad användares inkomst för en viss månad
 */
export async function updateMyIncome(req, res) {
  try {
    const { month, amount } = req.body;

    if (!month || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      });
    }

    const incomeNumber = Number(amount);
    if (!Number.isFinite(incomeNumber) || incomeNumber < 0) {
      return res.status(400).json({
        error: "ValidationError",
        message: "amount must be a number >= 0",
      });
    }

    if (!req.user.householdId) {
      return res.status(400).json({
        error: "ValidationError",
        message: "User is not connected to a household",
      });
    }

    const household = await Household.findById(req.user.householdId);

    if (!household) {
      return res.status(404).json({
        error: "NotFound",
        message: "Household not found",
      });
    }

    const member = household.members.find(
      (m) => String(m.userId) === String(req.user._id)
    );

    if (!member) {
      return res.status(404).json({
        error: "NotFound",
        message: "Member not found in household",
      });
    }

    const existingIncomeEntry = member.incomeHistory?.find(
      (entry) => entry.month === month
    );

    // Samma tanke här: finns månaden redan så uppdateras posten,
    // annars skapas en ny post i historiken.
    if (existingIncomeEntry) {
      existingIncomeEntry.amount = incomeNumber;
    } else {
      member.incomeHistory.push({
        month,
        amount: incomeNumber,
      });
    }

    // Uppdatera även monthlyIncome som "senast valda / nuvarande" fallback
    member.monthlyIncome = incomeNumber;

    await household.save();

    return res.status(200).json({
      message: "Income updated",
      income: {
        month,
        amount: incomeNumber,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}
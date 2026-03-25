import Household from "../models/Household.js";
import User from "../models/User.js";
import {
  getCurrentMonth,
  validateIncomeInput,
  upsertIncomeHistoryEntry,
  toHouseholdResponse,
} from "../services/householdService.js";

/**
 * POST /household/create
 * Skapar ett hushåll och kopplar inloggad user till det
 */
export async function createHousehold(req, res) {
  try {
    const { name, monthlyIncome } = req.body;

    const currentMonth = getCurrentMonth();

    let incomeNumber = 0;
    if (typeof monthlyIncome !== "undefined" && monthlyIncome !== "") {
      const validatedIncome = validateIncomeInput(monthlyIncome);

      if (!validatedIncome.ok) {
        return res.status(400).json(validatedIncome.error);
      }

      incomeNumber = validatedIncome.value;
    }

    const household = await Household.create({
      name: String(name || "My Household").trim(),
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
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
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

    const validatedIncome = validateIncomeInput(monthlyIncome);
    if (!validatedIncome.ok) {
      return res.status(400).json(validatedIncome.error);
    }

    const incomeNumber = validatedIncome.value;

    const household = await Household.findById(householdId);
    if (!household) {
      return res.status(404).json({
        error: "NotFound",
        message: "Household not found",
      });
    }

    const currentMonth = getCurrentMonth();

    // Om user redan är medlem → uppdatera income
    const existingMember = household.members.find(
      (member) => String(member.userId) === String(req.user._id)
    );

    if (existingMember) {
      existingMember.monthlyIncome = incomeNumber;

      // Om det redan finns en inkomstpost för månaden uppdateras den,
      // annars läggs en ny post till i historiken.
      upsertIncomeHistoryEntry(existingMember, currentMonth, incomeNumber);

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
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
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
      household: toHouseholdResponse(household),
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

    const validatedIncome = validateIncomeInput(amount, "amount");
    if (!validatedIncome.ok) {
      return res.status(400).json(validatedIncome.error);
    }

    const incomeNumber = validatedIncome.value;

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
      (memberEntry) => String(memberEntry.userId) === String(req.user._id)
    );

    if (!member) {
      return res.status(404).json({
        error: "NotFound",
        message: "Member not found in household",
      });
    }

    // Finns månaden redan uppdateras posten, annars skapas en ny.
    upsertIncomeHistoryEntry(member, month, incomeNumber);

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

/**
 * POST /household/leave
 * Låter inloggad användare lämna sitt nuvarande hushåll
 */
export async function leaveHousehold(req, res) {
  try {
    if (!req.user.householdId) {
      return res.status(400).json({
        error: "ValidationError",
        message: "User is not connected to a household",
      });
    }

    const household = await Household.findById(req.user.householdId);

    if (!household) {
      await User.findByIdAndUpdate(req.user._id, { householdId: null });

      return res.status(404).json({
        error: "NotFound",
        message: "Household not found",
      });
    }

    // Tar bort den inloggade användaren från members-listan.
    household.members = household.members.filter(
      (member) => String(member.userId) !== String(req.user._id)
    );

    // Kopplar bort användaren från hushållet i User-modellen.
    await User.findByIdAndUpdate(req.user._id, { householdId: null });

    // Om ingen medlem finns kvar tas hela hushållet bort.
    if (household.members.length === 0) {
      await Household.findByIdAndDelete(household._id);

      return res.status(200).json({
        message: "You left the household. Household was deleted because no members remained.",
      });
    }

    await household.save();

    return res.status(200).json({
      message: "You left the household successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}
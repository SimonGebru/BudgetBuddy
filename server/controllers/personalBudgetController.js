import PersonalBudgetPlan from "../models/PersonalBudgetPlan.js";
import {
  cleanPersonalBudgetItems,
  calculatePersonalBudgetSummary,
  validatePersonalBudgetMonth,
  getPreviousMonth,
  clonePersonalBudgetItems,
} from "../services/personalBudgetService.js";

/**
 * POST /personal-budget/plans
 * Skapar eller uppdaterar användarens personliga budget för en viss månad
 */
export async function upsertPersonalBudgetPlan(req, res) {
  try {
    const { month, incomes, expenses } = req.body;

    const validatedMonth = validatePersonalBudgetMonth(month);
    if (!validatedMonth.ok) {
      return res.status(400).json(validatedMonth.error);
    }

    if (!Array.isArray(incomes)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "incomes must be an array",
      });
    }

    if (!Array.isArray(expenses)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "expenses must be an array",
      });
    }

    const cleanedIncomes = cleanPersonalBudgetItems(incomes);
    const cleanedExpenses = cleanPersonalBudgetItems(expenses);

    // Om användaren sparar helt tomt ska ingen tom budget sparas i databasen.
    // Finns redan en budget för månaden tas den bort, annars görs ingenting.
    if (cleanedIncomes.length === 0 && cleanedExpenses.length === 0) {
      const existingPlan = await PersonalBudgetPlan.findOne({
        userId: req.user._id,
        month,
      }).exec();

      if (existingPlan) {
        await PersonalBudgetPlan.findByIdAndDelete(existingPlan._id);

        return res.status(200).json({
          message: "Personal budget cleared",
          plan: null,
        });
      }

      return res.status(200).json({
        message: "No personal budget data to save",
        plan: null,
      });
    }

    const plan = await PersonalBudgetPlan.findOneAndUpdate(
      {
        userId: req.user._id,
        month,
      },
      {
        $set: {
          incomes: cleanedIncomes,
          expenses: cleanedExpenses,
        },
        $setOnInsert: {
          userId: req.user._id,
          month,
        },
      },
      {
        new: true,
        upsert: true,
      }
    ).exec();

    return res.status(201).json({
      message: "Personal budget saved",
      plan,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * GET /personal-budget/plans/:month
 * Hämtar användarens personliga budgetsammanfattning för vald månad
 */
export async function getPersonalBudgetSummary(req, res) {
  try {
    const { month } = req.params;

    const validatedMonth = validatePersonalBudgetMonth(month);
    if (!validatedMonth.ok) {
      return res.status(400).json(validatedMonth.error);
    }

    const plan = await PersonalBudgetPlan.findOne({
      userId: req.user._id,
      month,
    }).exec();

    if (!plan) {
      return res.status(404).json({
        error: "NotFound",
        message: "Personal budget plan not found for month",
      });
    }

    const summary = calculatePersonalBudgetSummary(plan);

    return res.status(200).json(summary);
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * GET /personal-budget/history
 * Hämtar historik över användarens personliga budgetar
 */
export async function getPersonalBudgetHistory(req, res) {
  try {
    const plans = await PersonalBudgetPlan.find({
      userId: req.user._id,
    })
      .sort({ month: 1 })
      .exec();

    const history = plans.map((plan) => calculatePersonalBudgetSummary(plan));

    return res.status(200).json({
      history,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * POST /personal-budget/plans/:month/duplicate
 * Kopierar föregående månads personliga budget till vald månad
 */
export async function duplicatePersonalBudgetPlan(req, res) {
  try {
    const { month } = req.params;

    const validatedMonth = validatePersonalBudgetMonth(month);
    if (!validatedMonth.ok) {
      return res.status(400).json(validatedMonth.error);
    }

    const previousMonth = getPreviousMonth(month);

    const existingPlan = await PersonalBudgetPlan.findOne({
      userId: req.user._id,
      month,
    }).exec();

    if (existingPlan) {
      return res.status(409).json({
        error: "Conflict",
        message: "A personal budget already exists for this month",
      });
    }

    const previousPlan = await PersonalBudgetPlan.findOne({
      userId: req.user._id,
      month: previousMonth,
    }).exec();

    if (!previousPlan) {
      return res.status(404).json({
        error: "NotFound",
        message: "No personal budget found for previous month",
      });
    }

    const duplicatedPlan = await PersonalBudgetPlan.create({
      userId: req.user._id,
      month,
      incomes: clonePersonalBudgetItems(previousPlan.incomes),
      expenses: clonePersonalBudgetItems(previousPlan.expenses),
    });

    return res.status(201).json({
      message: "Personal budget duplicated from previous month",
      plan: duplicatedPlan,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}
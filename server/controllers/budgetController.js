import BudgetPlan from "../models/BudgetPlan.js";
import Household from "../models/Household.js";
import {
  roundMoney,
  validateSplit,
  calcWeights,
  getTotalBudget,
  buildPeopleSummary,
  buildCategorySummary,
  getDefaultSplit,
} from "../services/budgetService.js";

function getPreviousMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(year, monthNumber - 1, 1);
  date.setMonth(date.getMonth() - 1);

  const previousYear = date.getFullYear();
  const previousMonth = String(date.getMonth() + 1).padStart(2, "0");

  return `${previousYear}-${previousMonth}`;
}

function cloneBudgetCategories(categories = []) {
  return categories.map((category) => ({
    name: category.name,
    amount: Number(category.amount) || 0,
  }));
}

async function getValidatedHousehold(householdId) {
  const household = await Household.findById(householdId)
    .populate("members.userId", "name")
    .exec();

  if (!household) {
    return {
      ok: false,
      status: 404,
      error: {
        error: "NotFound",
        message: "Household not found",
      },
    };
  }

  // Endast 0 members ska vara error
  if (!household.members || household.members.length === 0) {
    return {
      ok: false,
      status: 400,
      error: {
        error: "ValidationError",
        message: "Household must have at least one member",
      },
    };
  }

  return {
    ok: true,
    household,
  };
}

export async function upsertBudgetPlan(req, res) {
  try {
    const { month, categories, split } = req.body;

    if (!month || typeof month !== "string") {
      return res.status(400).json({
        error: "ValidationError",
        message: "month is required (YYYY-MM)",
      });
    }

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "categories must be an array",
      });
    }

    // Städar inkommande kategorier så att bara giltiga värden sparas.
    const cleanedCategories = categories
      .map((category) => ({
        name: String(category.name || "").trim(),
        amount: Number(category.amount),
      }))
      .filter(
        (category) =>
          category.name.length > 0 &&
          Number.isFinite(category.amount) &&
          category.amount >= 0
      );

    const validatedSplit = validateSplit(split);
    if (!validatedSplit.ok) {
      return res.status(400).json(validatedSplit.error);
    }

    // Om användaren sparar ett tomt formulär ska ingen tom budget sparas i databasen.
    // Finns redan en budget för månaden tas den bort, annars görs ingenting.
    if (cleanedCategories.length === 0) {
      const existingPlan = await BudgetPlan.findOne({
        householdId: req.user.householdId,
        month,
      }).exec();

      if (existingPlan) {
        await BudgetPlan.findByIdAndDelete(existingPlan._id);

        return res.status(200).json({
          message: "Budget cleared",
          plan: null,
        });
      }

      return res.status(200).json({
        message: "No budget data to save",
        plan: null,
      });
    }

    // findOneAndUpdate + upsert gör att samma endpoint kan användas både för att skapa
    // en ny budgetplan och uppdatera en befintlig för samma månad.
    const plan = await BudgetPlan.findOneAndUpdate(
      { householdId: req.user.householdId, month },
      {
        $set: {
          categories: cleanedCategories,
          split: validatedSplit.split,
        },
        $setOnInsert: {
          householdId: req.user.householdId,
          month,
          createdBy: req.user._id,
        },
      },
      { new: true, upsert: true }
    ).exec();

    return res.status(201).json({
      message: "Budget plan saved",
      plan,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

export async function getBudgetSummary(req, res) {
  try {
    const { month } = req.params;

    const plan = await BudgetPlan.findOne({
      householdId: req.user.householdId,
      month,
    }).exec();

    if (!plan) {
      return res.status(404).json({
        error: "NotFound",
        message: "Budget plan not found for month",
      });
    }

    const householdResult = await getValidatedHousehold(req.user.householdId);
    if (!householdResult.ok) {
      return res.status(householdResult.status).json(householdResult.error);
    }

    const { household } = householdResult;
    const totalBudget = getTotalBudget(plan.categories);

    const split = plan.split || getDefaultSplit();
    const peopleWithWeights = calcWeights(split, household.members, month);

    const totalIncome = peopleWithWeights.reduce(
      (sum, person) => sum + person.monthlyIncome,
      0
    );

    const people = buildPeopleSummary(peopleWithWeights, totalBudget);
    const categories = buildCategorySummary(plan.categories, peopleWithWeights);

    
    const isSolo = household.members.length < 2;

    return res.status(200).json({
      householdId: req.user.householdId,
      month: plan.month,
      split,
      totalBudget: roundMoney(totalBudget),
      totalIncome: roundMoney(totalIncome),
      people,
      categories,
      isSolo, // 👈 viktig
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

export async function updateBudgetSplit(req, res) {
  try {
    const { month } = req.params;
    const { split } = req.body;

    if (!split || typeof split !== "object") {
      return res.status(400).json({
        error: "ValidationError",
        message: "split is required",
      });
    }

    const validatedSplit = validateSplit(split);
    if (!validatedSplit.ok) {
      return res.status(400).json(validatedSplit.error);
    }

    // Den här endpointen uppdaterar bara själva fördelningsläget, inte kategorierna i budgeten.
    const plan = await BudgetPlan.findOneAndUpdate(
      { householdId: req.user.householdId, month },
      {
        $set: {
          split: validatedSplit.split,
        },
      },
      { new: true }
    ).exec();

    if (!plan) {
      return res.status(404).json({
        error: "NotFound",
        message: "Budget plan not found for month",
      });
    }

    return res.status(200).json({
      message: "Budget split updated",
      plan,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

export async function getBudgetHistory(req, res) {
  try {
    const plans = await BudgetPlan.find({
      householdId: req.user.householdId,
    })
      .sort({ month: 1 })
      .exec();

    if (!plans.length) {
      return res.status(200).json({
        history: [],
      });
    }

    const householdResult = await getValidatedHousehold(req.user.householdId);
    if (!householdResult.ok) {
      return res.status(householdResult.status).json(householdResult.error);
    }

    const { household } = householdResult;

    const history = plans.map((plan) => {
      const totalBudget = getTotalBudget(plan.categories);
      const split = plan.split || getDefaultSplit();
      const peopleWithWeights = calcWeights(split, household.members, plan.month);
      const people = buildPeopleSummary(peopleWithWeights, totalBudget);

      const currentUser = people.find(
        (person) => String(person.userId) === String(req.user._id)
      );

      const partner = people.find(
        (person) => String(person.userId) !== String(req.user._id)
      );

      return {
        month: plan.month,
        totalBudget: roundMoney(totalBudget),
        yourShare: currentUser?.contributionTotal || 0,
        partnerShare: partner?.contributionTotal || 0,
        yourIncome: currentUser?.monthlyIncome || 0,
        partnerIncome: partner?.monthlyIncome || 0,
        splitMode: split.mode,
      };
    });

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

export async function duplicateBudgetPlan(req, res) {
  try {
    const { month } = req.params;

    if (!month || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      });
    }

    const previousMonth = getPreviousMonth(month);

    const existingPlan = await BudgetPlan.findOne({
      householdId: req.user.householdId,
      month,
    }).exec();

    if (existingPlan) {
      return res.status(409).json({
        error: "Conflict",
        message: "A household budget already exists for this month",
      });
    }

    const previousPlan = await BudgetPlan.findOne({
      householdId: req.user.householdId,
      month: previousMonth,
    }).exec();

    if (!previousPlan) {
      return res.status(404).json({
        error: "NotFound",
        message: "No household budget found for previous month",
      });
    }

    const duplicatedPlan = await BudgetPlan.create({
      householdId: req.user.householdId,
      month,
      createdBy: req.user._id,
      categories: cloneBudgetCategories(previousPlan.categories),
      split: previousPlan.split || getDefaultSplit(),
    });

    return res.status(201).json({
      message: "Household budget duplicated from previous month",
      plan: duplicatedPlan,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}
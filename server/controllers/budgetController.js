import BudgetPlan from "../models/BudgetPlan.js";
import Household from "../models/Household.js";

function roundMoney(n) {
  return Math.round(Number(n) || 0);
}

function calcWeights({ mode, percentMore }, members) {

  if (!Array.isArray(members) || members.length < 2) {
    return [];
  }

  // plocka inkomster
  const incomes = members.map((m) => ({
    userId: m.userId._id?.toString?.() || m.userId.toString(),
    name: m.userId.name,
    monthlyIncome: Number(m.monthlyIncome) || 0,
  }));

  if (mode === "equal") {
    const w = 1 / incomes.length;
    return incomes.map((p) => ({ ...p, weight: w }));
  }

  if (mode === "topEarnsMore") {
    // B-alternativet: top earner betalar (1 + p) gånger den andra (relativt)
    // Ex: percentMore=20 -> ratio=1.2
    // weights: top = ratio/(ratio+1), other = 1/(ratio+1)
    const ratio = 1 + (Number(percentMore) || 0) / 100;

    // hitta top earner baserat på inkomst
    const sorted = [...incomes].sort((a, b) => b.monthlyIncome - a.monthlyIncome);
    const top = sorted[0];
    const other = sorted[1];

    const topWeight = ratio / (ratio + 1);
    const otherWeight = 1 / (ratio + 1);

    // returnera i originalordning (samma som members)
    return incomes.map((p) => {
      if (p.userId === top.userId) return { ...p, weight: topWeight };
      if (p.userId === other.userId) return { ...p, weight: otherWeight };
      return { ...p, weight: 0 };
    });
  }

  // default: income proportion
  const totalIncome = incomes.reduce((sum, p) => sum + p.monthlyIncome, 0);

  // om totalIncome är 0: fallback till equal
  if (totalIncome <= 0) {
    const w = 1 / incomes.length;
    return incomes.map((p) => ({ ...p, weight: w }));
  }

  return incomes.map((p) => ({
    ...p,
    weight: p.monthlyIncome / totalIncome,
  }));
}

export async function upsertBudgetPlan(req, res) {
  try {
    const { month, categories, split } = req.body;

    if (!month || typeof month !== "string") {
      return res.status(400).json({ error: "ValidationError", message: "month is required (YYYY-MM)" });
    }

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "ValidationError", message: "categories must be an array" });
    }

    // städa categories
    const cleanedCategories = categories
      .map((c) => ({
        name: String(c.name || "").trim(),
        amount: Number(c.amount),
      }))
      .filter((c) => c.name.length > 0 && Number.isFinite(c.amount) && c.amount >= 0);

    // split: default income om inget skickas
    const mode = split?.mode || "income";
    const percentMore = Number(split?.percentMore || 0);

    if (!["income", "equal", "topEarnsMore"].includes(mode)) {
      return res.status(400).json({
        error: "ValidationError",
        message: 'split.mode must be "income", "equal" or "topEarnsMore"',
      });
    }

    if (mode === "topEarnsMore" && (!Number.isFinite(percentMore) || percentMore < 0 || percentMore > 200)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "split.percentMore must be a number between 0 and 200",
      });
    }

    const plan = await BudgetPlan.findOneAndUpdate(
      { householdId: req.user.householdId, month },
      {
        $set: {
          categories: cleanedCategories,
          split: { mode, percentMore: mode === "topEarnsMore" ? percentMore : 0 },
        },
        $setOnInsert: {
          householdId: req.user.householdId,
          month,
          createdBy: req.user._id,
        },
      },
      { new: true, upsert: true }
    ).exec();

    return res.status(201).json({ message: "Budget plan saved", plan });
  } catch (err) {
    return res.status(500).json({ error: "ServerError", message: err.message });
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
      return res.status(404).json({ error: "NotFound", message: "Budget plan not found for month" });
    }

    const household = await Household.findById(req.user.householdId)
      .populate("members.userId", "name")
      .exec();

    if (!household) {
      return res.status(404).json({ error: "NotFound", message: "Household not found" });
    }

    if (!household.members || household.members.length < 2) {
      return res.status(400).json({ error: "ValidationError", message: "At least two household members are required" });
    }

    const totalBudget = plan.categories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    // räkna weights beroende på split-mode
    const split = plan.split || { mode: "income", percentMore: 0 };
    const peopleWithWeights = calcWeights(split, household.members);

    const totalIncome = peopleWithWeights.reduce((sum, p) => sum + p.monthlyIncome, 0);

    // totals per person
    const people = peopleWithWeights.map((p) => ({
      userId: p.userId,
      name: p.name,
      monthlyIncome: p.monthlyIncome,
      weight: Number(p.weight.toFixed(4)),
      contributionTotal: roundMoney(totalBudget * p.weight),
    }));

    // per category
    const categories = plan.categories.map((cat) => {
      const perPersonRaw = peopleWithWeights.map((p) => ({
        userId: p.userId,
        name: p.name,
        amount: roundMoney((Number(cat.amount) || 0) * p.weight),
      }));

      // (valfritt) avrundningsjustering: se till att summan matchar category amount
      const catAmount = roundMoney(cat.amount);
      const sumRounded = perPersonRaw.reduce((s, x) => s + x.amount, 0);
      const diff = catAmount - sumRounded;

      // lägg diff på personen med störst weight (så det blir stabilt)
      if (diff !== 0) {
        let idx = 0;
        let best = -Infinity;
        perPersonRaw.forEach((p, i) => {
          const w = peopleWithWeights.find((x) => x.userId === p.userId)?.weight ?? 0;
          if (w > best) {
            best = w;
            idx = i;
          }
        });
        perPersonRaw[idx].amount += diff;
      }

      return {
        name: cat.name,
        amount: catAmount,
        perPerson: perPersonRaw,
      };
    });

    return res.status(200).json({
      householdId: req.user.householdId,
      month: plan.month,
      split, // så frontend visar “vilket läge”
      totalBudget: roundMoney(totalBudget),
      totalIncome: roundMoney(totalIncome),
      people,
      categories,
    });
  } catch (err) {
    return res.status(500).json({ error: "ServerError", message: err.message });
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

    const mode = split.mode || "income";
    const percentMore = Number(split.percentMore || 0);

    if (!["income", "equal", "topEarnsMore"].includes(mode)) {
      return res.status(400).json({
        error: "ValidationError",
        message: 'split.mode must be "income", "equal" or "topEarnsMore"',
      });
    }

    if (mode === "topEarnsMore") {
      if (!Number.isFinite(percentMore) || percentMore < 0 || percentMore > 200) {
        return res.status(400).json({
          error: "ValidationError",
          message: "split.percentMore must be a number between 0 and 200",
        });
      }
    }

    const plan = await BudgetPlan.findOneAndUpdate(
      { householdId: req.user.householdId, month },
      {
        $set: {
          split: { mode, percentMore: mode === "topEarnsMore" ? percentMore : 0 },
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
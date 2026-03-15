import BudgetPlan from "../models/BudgetPlan.js";
import Household from "../models/Household.js";

function roundMoney(n) {
  // Rundar till heltal så att summor blir enklare att visa och jämföra i budgeten.
  return Math.round(Number(n) || 0);
}

function getIncomeForMonth(member, month) {
  const history = Array.isArray(member.incomeHistory) ? member.incomeHistory : [];

  const match = history.find((entry) => entry.month === month);

  // Om det finns ett sparat värde för just den månaden används det,
  // annars faller vi tillbaka på användarens vanliga månadsinkomst.
  if (match) {
    return Number(match.amount) || 0;
  }

  return Number(member.monthlyIncome) || 0;
}

function calcWeights({ mode, percentMore }, members, month) {
  if (!Array.isArray(members) || members.length < 2) {
    return [];
  }

  // Här plockar jag ut den data som faktiskt behövs för själva fördelningen.
  const incomes = members.map((m) => ({
    userId: m.userId._id?.toString?.() || m.userId.toString(),
    name: m.userId.name,
    monthlyIncome: getIncomeForMonth(m, month),
  }));

  // Equal betyder att alla delar lika mycket oavsett inkomst.
  if (mode === "equal") {
    const w = 1 / incomes.length;
    return incomes.map((p) => ({ ...p, weight: w }));
  }

  if (mode === "topEarnsMore") {
    // Det här läget betyder att den som tjänar mest betalar en viss procent mer än den andra.
    // Exempel: 20% mer blir ett förhållande på 1.2 mot 1.
    const ratio = 1 + (Number(percentMore) || 0) / 100;

    // Sorterar fram vem som tjänar mest just den här månaden.
    const sorted = [...incomes].sort((a, b) => b.monthlyIncome - a.monthlyIncome);
    const top = sorted[0];
    const other = sorted[1];

    // Om båda tjänar lika mycket finns det ingen tydlig "top earner",
    // så då blir det mer rimligt att falla tillbaka till equal.
    if (top.monthlyIncome === other.monthlyIncome) {
      const w = 1 / incomes.length;
      return incomes.map((p) => ({ ...p, weight: w }));
    }

    const topWeight = ratio / (ratio + 1);
    const otherWeight = 1 / (ratio + 1);

    // Returnerar vikterna i samma ordning som members hade från början.
    return incomes.map((p) => {
      if (p.userId === top.userId) return { ...p, weight: topWeight };
      if (p.userId === other.userId) return { ...p, weight: otherWeight };
      return { ...p, weight: 0 };
    });
  }

  // Standardläget är att budgeten delas proportionellt efter inkomst.
  const totalIncome = incomes.reduce((sum, p) => sum + p.monthlyIncome, 0);

  // Om båda inkomsterna saknas eller blir 0 går det inte att räkna proportioner,
  // så då kör vi equal istället.
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

    // Städar inkommande kategorier så att bara giltiga värden sparas.
    const cleanedCategories = categories
      .map((c) => ({
        name: String(c.name || "").trim(),
        amount: Number(c.amount),
      }))
      .filter((c) => c.name.length > 0 && Number.isFinite(c.amount) && c.amount >= 0);

    // Om frontend inte skickar något split-läge används income som standard.
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

    // findOneAndUpdate + upsert gör att samma endpoint kan användas både för att skapa
    // en ny budgetplan och uppdatera en befintlig för samma månad.
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

    // Räknar ut hur stor del varje person ska stå för beroende på valt split-läge.
    const split = plan.split || { mode: "income", percentMore: 0 };
    const peopleWithWeights = calcWeights(split, household.members, month);

    const totalIncome = peopleWithWeights.reduce((sum, p) => sum + p.monthlyIncome, 0);

    // Bygger en enklare struktur för totalsumman per person.
    const people = peopleWithWeights.map((p) => ({
      userId: p.userId,
      name: p.name,
      monthlyIncome: p.monthlyIncome,
      weight: Number(p.weight.toFixed(4)),
      contributionTotal: roundMoney(totalBudget * p.weight),
    }));

    // Räknar även ut fördelning per kategori så att frontend kan visa mer detaljerat vad var och en ska betala.
    const categories = plan.categories.map((cat) => {
      const perPersonRaw = peopleWithWeights.map((p) => ({
        userId: p.userId,
        name: p.name,
        amount: roundMoney((Number(cat.amount) || 0) * p.weight),
      }));

      // Efter avrundning kan det skilja någon krona, så här justeras det så att summan
      // faktiskt matchar kategorins totalbelopp.
      const catAmount = roundMoney(cat.amount);
      const sumRounded = perPersonRaw.reduce((s, x) => s + x.amount, 0);
      const diff = catAmount - sumRounded;

      // Diffen läggs på personen med högst vikt för att få en stabil och förutsägbar fördelning.
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
      split,
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

    // Den här endpointen uppdaterar bara själva fördelningsläget, inte kategorierna i budgeten.
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
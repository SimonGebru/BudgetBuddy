function roundMoney(value) {
  return Math.round(Number(value) || 0);
}

export function validatePersonalBudgetMonth(month) {
  if (!month || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      },
    };
  }

  return { ok: true };
}

export function cleanPersonalBudgetItems(items) {
  return items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      amount: Number(item?.amount),
    }))
    .filter(
      (item) =>
        item.name.length > 0 &&
        Number.isFinite(item.amount) &&
        item.amount >= 0
    );
}

export function getTotalFromItems(items = []) {
  return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function calculatePersonalBudgetSummary(plan) {
  const incomes = Array.isArray(plan.incomes) ? plan.incomes : [];
  const expenses = Array.isArray(plan.expenses) ? plan.expenses : [];

  const totalIncome = roundMoney(getTotalFromItems(incomes));
  const totalExpenses = roundMoney(getTotalFromItems(expenses));
  const remaining = roundMoney(totalIncome - totalExpenses);

  return {
    id: plan._id,
    month: plan.month,
    incomes: incomes.map((income) => ({
      id: income._id,
      name: income.name,
      amount: roundMoney(income.amount),
    })),
    expenses: expenses.map((expense) => ({
      id: expense._id,
      name: expense.name,
      amount: roundMoney(expense.amount),
    })),
    totalIncome,
    totalExpenses,
    remaining,
  };
}

export function getPreviousMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);

  const date = new Date(year, monthNumber - 1, 1);
  date.setMonth(date.getMonth() - 1);

  const previousYear = date.getFullYear();
  const previousMonth = String(date.getMonth() + 1).padStart(2, "0");

  return `${previousYear}-${previousMonth}`;
}

export function clonePersonalBudgetItems(items = []) {
  return items.map((item) => ({
    name: item.name,
    amount: Number(item.amount) || 0,
  }));
}
import {
  validatePersonalBudgetMonth,
  cleanPersonalBudgetItems,
  getTotalFromItems,
  calculatePersonalBudgetSummary,
  getPreviousMonth,
  clonePersonalBudgetItems,
} from "../services/personalBudgetService.js";

describe("validatePersonalBudgetMonth", () => {
  it("should return ok true for a valid month", () => {
    const result = validatePersonalBudgetMonth("2026-04");

    expect(result).toEqual({ ok: true });
  });

  it("should return error for missing month", () => {
    const result = validatePersonalBudgetMonth();

    expect(result).toEqual({
      ok: false,
      error: {
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      },
    });
  });

  it("should return error for invalid format", () => {
    const result = validatePersonalBudgetMonth("04-2026");

    expect(result).toEqual({
      ok: false,
      error: {
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      },
    });
  });

  it("should return error for non-string value", () => {
    const result = validatePersonalBudgetMonth(202604);

    expect(result).toEqual({
      ok: false,
      error: {
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      },
    });
  });
});

describe("cleanPersonalBudgetItems", () => {
  it("should trim names and convert amount to number", () => {
    const input = [
      { name: " Salary ", amount: "10000" },
      { name: " Freelance ", amount: 2500 },
    ];

    const result = cleanPersonalBudgetItems(input);

    expect(result).toEqual([
      { name: "Salary", amount: 10000 },
      { name: "Freelance", amount: 2500 },
    ]);
  });

  it("should remove items with empty names", () => {
    const input = [
      { name: "", amount: 1000 },
      { name: "  ", amount: 2000 },
      { name: "CSN", amount: 3000 },
    ];

    const result = cleanPersonalBudgetItems(input);

    expect(result).toEqual([{ name: "CSN", amount: 3000 }]);
  });

  it("should remove items with invalid or negative amounts", () => {
    const input = [
      { name: "Salary", amount: -1000 },
      { name: "Gift", amount: "abc" },
      { name: "CSN", amount: 5000 },
    ];

    const result = cleanPersonalBudgetItems(input);

    expect(result).toEqual([{ name: "CSN", amount: 5000 }]);
  });

  it("should handle missing fields safely", () => {
    const input = [
      {},
      { name: null, amount: 1000 },
      { name: "Bonus", amount: 2000 },
    ];

    const result = cleanPersonalBudgetItems(input);

    expect(result).toEqual([{ name: "Bonus", amount: 2000 }]);
  });
});

describe("getTotalFromItems", () => {
  it("should return the correct total", () => {
    const items = [
      { name: "Salary", amount: 10000 },
      { name: "CSN", amount: 5000 },
      { name: "Extra", amount: 1500 },
    ];

    const result = getTotalFromItems(items);

    expect(result).toBe(16500);
  });

  it("should return 0 for an empty array", () => {
    const result = getTotalFromItems([]);

    expect(result).toBe(0);
  });

  it("should handle invalid values as 0", () => {
    const items = [
      { name: "Salary", amount: 10000 },
      { name: "Broken", amount: "abc" },
      { name: "Extra", amount: null },
    ];

    const result = getTotalFromItems(items);

    expect(result).toBe(10000);
  });
});

describe("calculatePersonalBudgetSummary", () => {
  it("should calculate total income, total expenses and remaining", () => {
    const plan = {
      _id: "plan1",
      month: "2026-04",
      incomes: [
        { _id: "i1", name: "Salary", amount: 10000 },
        { _id: "i2", name: "CSN", amount: 5000 },
      ],
      expenses: [
        { _id: "e1", name: "Rent", amount: 6000 },
        { _id: "e2", name: "Food", amount: 2000 },
      ],
    };

    const result = calculatePersonalBudgetSummary(plan);

    expect(result).toEqual({
      id: "plan1",
      month: "2026-04",
      incomes: [
        { id: "i1", name: "Salary", amount: 10000 },
        { id: "i2", name: "CSN", amount: 5000 },
      ],
      expenses: [
        { id: "e1", name: "Rent", amount: 6000 },
        { id: "e2", name: "Food", amount: 2000 },
      ],
      totalIncome: 15000,
      totalExpenses: 8000,
      remaining: 7000,
    });
  });

  it("should handle empty incomes and expenses", () => {
    const plan = {
      _id: "plan2",
      month: "2026-05",
      incomes: [],
      expenses: [],
    };

    const result = calculatePersonalBudgetSummary(plan);

    expect(result).toEqual({
      id: "plan2",
      month: "2026-05",
      incomes: [],
      expenses: [],
      totalIncome: 0,
      totalExpenses: 0,
      remaining: 0,
    });
  });

  it("should handle missing incomes and expenses arrays", () => {
    const plan = {
      _id: "plan3",
      month: "2026-06",
    };

    const result = calculatePersonalBudgetSummary(plan);

    expect(result).toEqual({
      id: "plan3",
      month: "2026-06",
      incomes: [],
      expenses: [],
      totalIncome: 0,
      totalExpenses: 0,
      remaining: 0,
    });
  });

  it("should round decimal amounts correctly", () => {
    const plan = {
      _id: "plan4",
      month: "2026-07",
      incomes: [{ _id: "i1", name: "Salary", amount: 10000.6 }],
      expenses: [{ _id: "e1", name: "Rent", amount: 6000.4 }],
    };

    const result = calculatePersonalBudgetSummary(plan);

    expect(result).toEqual({
      id: "plan4",
      month: "2026-07",
      incomes: [{ id: "i1", name: "Salary", amount: 10001 }],
      expenses: [{ id: "e1", name: "Rent", amount: 6000 }],
      totalIncome: 10001,
      totalExpenses: 6000,
      remaining: 4001,
    });
  });
});

describe("getPreviousMonth", () => {
  it("should return the previous month", () => {
    expect(getPreviousMonth("2026-05")).toBe("2026-04");
  });

  it("should handle year change correctly", () => {
    expect(getPreviousMonth("2026-01")).toBe("2025-12");
  });
});

describe("clonePersonalBudgetItems", () => {
  it("should clone items with numeric amounts", () => {
    const items = [
      { name: "Salary", amount: "10000" },
      { name: "CSN", amount: 5000 },
    ];

    const result = clonePersonalBudgetItems(items);

    expect(result).toEqual([
      { name: "Salary", amount: 10000 },
      { name: "CSN", amount: 5000 },
    ]);
  });

  it("should default invalid amounts to 0", () => {
    const items = [
      { name: "Salary", amount: "abc" },
      { name: "Gift", amount: null },
    ];

    const result = clonePersonalBudgetItems(items);

    expect(result).toEqual([
      { name: "Salary", amount: 0 },
      { name: "Gift", amount: 0 },
    ]);
  });

  it("should return an empty array when no items are provided", () => {
    expect(clonePersonalBudgetItems()).toEqual([]);
  });
});
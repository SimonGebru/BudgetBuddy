import {
  roundMoney,
  getIncomeForMonth,
  validateSplit,
  calcWeights,
  getTotalBudget,
  buildPeopleSummary,
  buildCategorySummary,
  getDefaultSplit,
} from "../services/budgetService.js";

describe("roundMoney", () => {
  it("should round numbers correctly", () => {
    expect(roundMoney(10.4)).toBe(10);
    expect(roundMoney(10.5)).toBe(11);
    expect(roundMoney("15.6")).toBe(16);
  });

  it("should return 0 for invalid values", () => {
    expect(roundMoney(undefined)).toBe(0);
    expect(roundMoney(null)).toBe(0);
    expect(roundMoney("abc")).toBe(0);
  });
});

describe("getIncomeForMonth", () => {
  it("should return income from incomeHistory if month exists", () => {
    const member = {
      monthlyIncome: 10000,
      incomeHistory: [
        { month: "2026-04", amount: 15000 },
        { month: "2026-05", amount: 20000 },
      ],
    };

    expect(getIncomeForMonth(member, "2026-05")).toBe(20000);
  });

  it("should fall back to monthlyIncome if month is missing", () => {
    const member = {
      monthlyIncome: 12000,
      incomeHistory: [{ month: "2026-04", amount: 15000 }],
    };

    expect(getIncomeForMonth(member, "2026-05")).toBe(12000);
  });

  it("should return 0 if no valid income exists", () => {
    const member = {
      monthlyIncome: null,
      incomeHistory: [],
    };

    expect(getIncomeForMonth(member, "2026-05")).toBe(0);
  });
});

describe("validateSplit", () => {
  it("should accept income mode", () => {
    const result = validateSplit({ mode: "income" });

    expect(result).toEqual({
      ok: true,
      split: {
        mode: "income",
        percentMore: 0,
      },
    });
  });

  it("should accept equal mode", () => {
    const result = validateSplit({ mode: "equal" });

    expect(result).toEqual({
      ok: true,
      split: {
        mode: "equal",
        percentMore: 0,
      },
    });
  });

  it("should accept topEarnsMore with valid percentMore", () => {
    const result = validateSplit({
      mode: "topEarnsMore",
      percentMore: 20,
    });

    expect(result).toEqual({
      ok: true,
      split: {
        mode: "topEarnsMore",
        percentMore: 20,
      },
    });
  });

  it("should reject invalid split mode", () => {
    const result = validateSplit({ mode: "randomMode" });

    expect(result.ok).toBe(false);
    expect(result.error.message).toBe(
      'split.mode must be "income", "equal" or "topEarnsMore"'
    );
  });

  it("should reject invalid percentMore in topEarnsMore mode", () => {
    const result = validateSplit({
      mode: "topEarnsMore",
      percentMore: 500,
    });

    expect(result.ok).toBe(false);
    expect(result.error.message).toBe(
      "split.percentMore must be a number between 0 and 200"
    );
  });
});

describe("getTotalBudget", () => {
  it("should return the correct total budget", () => {
    const categories = [
      { name: "Rent", amount: 6000 },
      { name: "Food", amount: 2000 },
      { name: "Fun", amount: 1000 },
    ];

    expect(getTotalBudget(categories)).toBe(9000);
  });

  it("should return 0 for empty categories", () => {
    expect(getTotalBudget([])).toBe(0);
  });
});

describe("calcWeights", () => {
  const members = [
    {
      userId: { _id: "u1", name: "Simon" },
      monthlyIncome: 30000,
      incomeHistory: [],
    },
    {
      userId: { _id: "u2", name: "Alex" },
      monthlyIncome: 20000,
      incomeHistory: [],
    },
  ];

  it("should return equal weights in equal mode", () => {
    const result = calcWeights({ mode: "equal", percentMore: 0 }, members, "2026-04");

    expect(result).toEqual([
      {
        userId: "u1",
        name: "Simon",
        monthlyIncome: 30000,
        weight: 0.5,
      },
      {
        userId: "u2",
        name: "Alex",
        monthlyIncome: 20000,
        weight: 0.5,
      },
    ]);
  });

  it("should return proportional weights in income mode", () => {
    const result = calcWeights({ mode: "income", percentMore: 0 }, members, "2026-04");

    expect(result[0].weight).toBeCloseTo(0.6);
    expect(result[1].weight).toBeCloseTo(0.4);
  });

  it("should fall back to equal if total income is 0 in income mode", () => {
    const zeroIncomeMembers = [
      {
        userId: { _id: "u1", name: "Simon" },
        monthlyIncome: 0,
        incomeHistory: [],
      },
      {
        userId: { _id: "u2", name: "Alex" },
        monthlyIncome: 0,
        incomeHistory: [],
      },
    ];

    const result = calcWeights(
      { mode: "income", percentMore: 0 },
      zeroIncomeMembers,
      "2026-04"
    );

    expect(result[0].weight).toBe(0.5);
    expect(result[1].weight).toBe(0.5);
  });

  it("should give higher weight to top earner in topEarnsMore mode", () => {
    const result = calcWeights(
      { mode: "topEarnsMore", percentMore: 20 },
      members,
      "2026-04"
    );

    expect(result[0].weight).toBeCloseTo(0.54545, 4);
    expect(result[1].weight).toBeCloseTo(0.45454, 4);
  });

  it("should fall back to equal in topEarnsMore if incomes are equal", () => {
    const equalIncomeMembers = [
      {
        userId: { _id: "u1", name: "Simon" },
        monthlyIncome: 20000,
        incomeHistory: [],
      },
      {
        userId: { _id: "u2", name: "Alex" },
        monthlyIncome: 20000,
        incomeHistory: [],
      },
    ];

    const result = calcWeights(
      { mode: "topEarnsMore", percentMore: 20 },
      equalIncomeMembers,
      "2026-04"
    );

    expect(result[0].weight).toBe(0.5);
    expect(result[1].weight).toBe(0.5);
  });
});

describe("buildPeopleSummary", () => {
  it("should build summary with rounded contribution totals", () => {
    const peopleWithWeights = [
      {
        userId: "u1",
        name: "Simon",
        monthlyIncome: 30000,
        weight: 0.6,
      },
      {
        userId: "u2",
        name: "Alex",
        monthlyIncome: 20000,
        weight: 0.4,
      },
    ];

    const result = buildPeopleSummary(peopleWithWeights, 10000);

    expect(result).toEqual([
      {
        userId: "u1",
        name: "Simon",
        monthlyIncome: 30000,
        weight: 0.6,
        contributionTotal: 6000,
      },
      {
        userId: "u2",
        name: "Alex",
        monthlyIncome: 20000,
        weight: 0.4,
        contributionTotal: 4000,
      },
    ]);
  });
});

describe("buildCategorySummary", () => {
  it("should build per-person category summary", () => {
    const categories = [{ name: "Rent", amount: 1000 }];
    const peopleWithWeights = [
      { userId: "u1", name: "Simon", weight: 0.6 },
      { userId: "u2", name: "Alex", weight: 0.4 },
    ];

    const result = buildCategorySummary(categories, peopleWithWeights);

    expect(result).toEqual([
      {
        name: "Rent",
        amount: 1000,
        perPerson: [
          { userId: "u1", name: "Simon", amount: 600 },
          { userId: "u2", name: "Alex", amount: 400 },
        ],
      },
    ]);
  });

  it("should adjust rounding diff to the highest weight person", () => {
    const categories = [{ name: "Food", amount: 1001 }];
    const peopleWithWeights = [
      { userId: "u1", name: "Simon", weight: 0.5 },
      { userId: "u2", name: "Alex", weight: 0.5 },
    ];

    const result = buildCategorySummary(categories, peopleWithWeights);

    const total = result[0].perPerson.reduce((sum, person) => sum + person.amount, 0);
    expect(total).toBe(1001);
  });
});

describe("getDefaultSplit", () => {
  it("should return the default split config", () => {
    expect(getDefaultSplit()).toEqual({
      mode: "income",
      percentMore: 0,
    });
  });
});
import request from "supertest";
import app from "../app.js";
import BudgetPlan from "../models/BudgetPlan.js";
import Household from "../models/Household.js";

jest.mock("../models/BudgetPlan.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock("../models/Household.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock("../middleware/requireAuth.js", () => ({
  __esModule: true,
  requireAuth: (req, res, next) => {
    req.user = {
      _id: "user1",
      householdId: "house1",
    };
    next();
  },
}));

describe("GET /budget/:month", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if budget not found", async () => {
    BudgetPlan.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get("/budget/plans/2026-04/summary");

    expect(res.statusCode).toBe(404);
  });
});

it("should return equal split summary", async () => {
  BudgetPlan.findOne.mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      month: "2026-04",
      categories: [{ name: "Rent", amount: 10000 }],
      split: { mode: "equal" },
    }),
  });

  Household.findById.mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({
      members: [
        {
          userId: { _id: "user1", name: "Simon" },
          monthlyIncome: 10000,
        },
        {
          userId: { _id: "user2", name: "Alex" },
          monthlyIncome: 20000,
        },
      ],
    }),
  });

  const res = await request(app).get("/budget/plans/2026-04/summary");

  expect(res.statusCode).toBe(200);
  expect(res.body.totalBudget).toBe(10000);

  // equal → båda ska betala 50%
  expect(res.body.people[0].contributionTotal).toBe(5000);
  expect(res.body.people[1].contributionTotal).toBe(5000);
});

it("should apply topEarnsMore split correctly", async () => {
  BudgetPlan.findOne.mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      month: "2026-04",
      categories: [{ name: "Rent", amount: 10000 }],
      split: { mode: "topEarnsMore", percentMore: 50 },
    }),
  });

  Household.findById.mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue({
      members: [
        {
          userId: { _id: "user1", name: "Simon" },
          monthlyIncome: 10000,
        },
        {
          userId: { _id: "user2", name: "Alex" },
          monthlyIncome: 20000,
        },
      ],
    }),
  });

  const res = await request(app).get("/budget/plans/2026-04/summary");

  expect(res.statusCode).toBe(200);

  const people = res.body.people;

  const total = people[0].contributionTotal + people[1].contributionTotal;

  expect(total).toBe(10000);

  // top earner ska betala MER
  expect(
    Math.max(people[0].contributionTotal, people[1].contributionTotal)
  ).toBeGreaterThan(
    Math.min(people[0].contributionTotal, people[1].contributionTotal)
  );
});
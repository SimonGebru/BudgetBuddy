import request from "supertest";
import app from "../app.js";
import PersonalBudgetPlan from "../models/PersonalBudgetPlan.js";

jest.mock("../models/PersonalBudgetPlan.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

// Mocka auth middleware så vi slipper JWT
jest.mock("../middleware/requireAuth.js", () => ({
  __esModule: true,
  requireAuth: (req, res, next) => {
    req.user = { _id: "user1" };
    next();
  },
}));

describe("GET /personal-budget/plans/:month", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if no plan exists", async () => {
    PersonalBudgetPlan.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get("/personal-budget/plans/2026-04");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: "NotFound",
      message: "Personal budget plan not found for month",
    });
  });

  it("should return summary if plan exists", async () => {
    PersonalBudgetPlan.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: "plan1",
        month: "2026-04",
        incomes: [{ _id: "i1", name: "Salary", amount: 10000 }],
        expenses: [{ _id: "e1", name: "Rent", amount: 6000 }],
      }),
    });

    const res = await request(app).get("/personal-budget/plans/2026-04");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalIncome).toBe(10000);
    expect(res.body.totalExpenses).toBe(6000);
    expect(res.body.remaining).toBe(4000);
  });
});

describe("POST /personal-budget/plans", () => {
  it("should return 400 if month is invalid", async () => {
    const res = await request(app)
      .post("/personal-budget/plans")
      .send({
        month: "04-2026",
        incomes: [],
        expenses: [],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("ValidationError");
  });

  it("should return 200 and not save if empty budget", async () => {
    PersonalBudgetPlan.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .post("/personal-budget/plans")
      .send({
        month: "2026-04",
        incomes: [],
        expenses: [],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: "No personal budget data to save",
      plan: null,
    });
  });

  it("should save budget and return 201", async () => {
    PersonalBudgetPlan.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: "plan1",
        month: "2026-04",
        incomes: [{ name: "Salary", amount: 10000 }],
        expenses: [{ name: "Rent", amount: 6000 }],
      }),
    });

    const res = await request(app)
      .post("/personal-budget/plans")
      .send({
        month: "2026-04",
        incomes: [{ name: "Salary", amount: 10000 }],
        expenses: [{ name: "Rent", amount: 6000 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Personal budget saved");
  });
});
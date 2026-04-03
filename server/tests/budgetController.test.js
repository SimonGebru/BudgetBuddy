import {
  upsertBudgetPlan,
  getBudgetSummary,
  updateBudgetSplit,
  getBudgetHistory,
  duplicateBudgetPlan,
} from "../controllers/budgetController.js";
import BudgetPlan from "../models/BudgetPlan.js";
import Household from "../models/Household.js";

jest.mock("../models/BudgetPlan.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("../models/Household.js", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("budgetController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertBudgetPlan", () => {
    it("should return 400 if month is missing", async () => {
      const req = {
        body: {
          categories: [],
          split: { mode: "income" },
        },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await upsertBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "month is required (YYYY-MM)",
      });
    });

    it("should return 400 if categories is not an array", async () => {
      const req = {
        body: {
          month: "2026-04",
          categories: "not-array",
          split: { mode: "income" },
        },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await upsertBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "categories must be an array",
      });
    });

    it("should return 400 if split is invalid", async () => {
      const req = {
        body: {
          month: "2026-04",
          categories: [{ name: "Rent", amount: 5000 }],
          split: { mode: "invalid-mode" },
        },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await upsertBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: 'split.mode must be "income", "equal" or "topEarnsMore"',
      });
    });

    it("should return 200 and do nothing if cleaned categories are empty and no plan exists", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const req = {
        body: {
          month: "2026-04",
          categories: [],
          split: { mode: "income" },
        },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await upsertBudgetPlan(req, res);

      expect(BudgetPlan.findOne).toHaveBeenCalledWith({
        householdId: "house1",
        month: "2026-04",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "No budget data to save",
        plan: null,
      });
    });

    it("should delete existing plan if cleaned categories are empty", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "plan1" }),
      });
      BudgetPlan.findByIdAndDelete.mockResolvedValue({});

      const req = {
        body: {
          month: "2026-04",
          categories: [],
          split: { mode: "income" },
        },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await upsertBudgetPlan(req, res);

      expect(BudgetPlan.findByIdAndDelete).toHaveBeenCalledWith("plan1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Budget cleared",
        plan: null,
      });
    });

    it("should save budget plan and return 201", async () => {
      const savedPlan = {
        _id: "plan1",
        month: "2026-04",
        categories: [{ name: "Rent", amount: 5000 }],
        split: { mode: "income", percentMore: 0 },
      };

      BudgetPlan.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(savedPlan),
      });

      const req = {
        body: {
          month: "2026-04",
          categories: [{ name: " Rent ", amount: "5000" }],
          split: { mode: "income" },
        },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await upsertBudgetPlan(req, res);

      expect(BudgetPlan.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Budget plan saved",
        plan: savedPlan,
      });
    });
  });

  describe("getBudgetSummary", () => {
    it("should return 404 if budget plan is missing", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const req = {
        params: { month: "2026-04" },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "NotFound",
        message: "Budget plan not found for month",
      });
    });

    it("should return 404 if household is missing", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          month: "2026-04",
          categories: [{ name: "Rent", amount: 10000 }],
          split: { mode: "income", percentMore: 0 },
        }),
      });

      Household.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const req = {
        params: { month: "2026-04" },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "NotFound",
        message: "Household not found",
      });
    });

    it("should return 400 if household has fewer than two members", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          month: "2026-04",
          categories: [{ name: "Rent", amount: 10000 }],
          split: { mode: "income", percentMore: 0 },
        }),
      });

      Household.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            members: [{ userId: { _id: "u1", name: "Simon" }, monthlyIncome: 30000 }],
          }),
        }),
      });

      const req = {
        params: { month: "2026-04" },
        user: { _id: "user1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "At least two household members are required",
      });
    });

    it("should return summary in equal mode", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          month: "2026-04",
          categories: [{ name: "Rent", amount: 10000 }],
          split: { mode: "equal", percentMore: 0 },
        }),
      });

      Household.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            members: [
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
            ],
          }),
        }),
      });

      const req = {
        params: { month: "2026-04" },
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const payload = res.json.mock.calls[0][0];

      expect(payload.split).toEqual({ mode: "equal", percentMore: 0 });
      expect(payload.totalBudget).toBe(10000);
      expect(payload.totalIncome).toBe(50000);
      expect(payload.people).toHaveLength(2);
      expect(payload.people[0].contributionTotal).toBe(5000);
      expect(payload.people[1].contributionTotal).toBe(5000);
    });

    it("should return summary in topEarnsMore mode", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          month: "2026-04",
          categories: [{ name: "Rent", amount: 10000 }],
          split: { mode: "topEarnsMore", percentMore: 20 },
        }),
      });

      Household.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            members: [
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
            ],
          }),
        }),
      });

      const req = {
        params: { month: "2026-04" },
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const payload = res.json.mock.calls[0][0];

      expect(payload.split).toEqual({ mode: "topEarnsMore", percentMore: 20 });
      expect(payload.people).toHaveLength(2);
      expect(payload.people[0].contributionTotal).toBeGreaterThan(
        payload.people[1].contributionTotal
      );
    });
  });

  describe("updateBudgetSplit", () => {
    it("should return 400 if split is missing", async () => {
      const req = {
        params: { month: "2026-04" },
        body: {},
        user: { householdId: "house1" },
      };
      const res = createMockRes();

      await updateBudgetSplit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "split is required",
      });
    });

    it("should return 404 if plan is not found", async () => {
      BudgetPlan.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const req = {
        params: { month: "2026-04" },
        body: { split: { mode: "equal" } },
        user: { householdId: "house1" },
      };
      const res = createMockRes();

      await updateBudgetSplit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "NotFound",
        message: "Budget plan not found for month",
      });
    });

    it("should update split and return 200", async () => {
      const updatedPlan = {
        month: "2026-04",
        split: { mode: "equal", percentMore: 0 },
      };

      BudgetPlan.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPlan),
      });

      const req = {
        params: { month: "2026-04" },
        body: { split: { mode: "equal" } },
        user: { householdId: "house1" },
      };
      const res = createMockRes();

      await updateBudgetSplit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Budget split updated",
        plan: updatedPlan,
      });
    });
  });

  describe("getBudgetHistory", () => {
    it("should return empty history if no plans exist", async () => {
      BudgetPlan.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const req = {
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        history: [],
      });
    });

    it("should return history for saved plans", async () => {
      BudgetPlan.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              month: "2026-04",
              categories: [{ name: "Rent", amount: 10000 }],
              split: { mode: "income", percentMore: 0 },
            },
          ]),
        }),
      });

      Household.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            members: [
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
            ],
          }),
        }),
      });

      const req = {
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await getBudgetHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const payload = res.json.mock.calls[0][0];
      expect(payload.history).toHaveLength(1);
      expect(payload.history[0].month).toBe("2026-04");
      expect(payload.history[0].totalBudget).toBe(10000);
      expect(payload.history[0].splitMode).toBe("income");
    });
  });

  describe("duplicateBudgetPlan", () => {
    it("should return 400 for invalid month", async () => {
      const req = {
        params: { month: "04-2026" },
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await duplicateBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      });
    });

    it("should return 409 if target month already exists", async () => {
      BudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "existing" }),
      });

      const req = {
        params: { month: "2026-05" },
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await duplicateBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Conflict",
        message: "A household budget already exists for this month",
      });
    });

    it("should return 404 if previous month budget is missing", async () => {
      BudgetPlan.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        });

      const req = {
        params: { month: "2026-05" },
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await duplicateBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "NotFound",
        message: "No household budget found for previous month",
      });
    });

    it("should duplicate previous month budget and return 201", async () => {
      const previousPlan = {
        categories: [{ name: "Rent", amount: 10000 }],
        split: { mode: "equal", percentMore: 0 },
      };

      const duplicatedPlan = {
        _id: "newPlan",
        householdId: "house1",
        month: "2026-05",
        createdBy: "u1",
        categories: [{ name: "Rent", amount: 10000 }],
        split: { mode: "equal", percentMore: 0 },
      };

      BudgetPlan.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(previousPlan),
        });

      BudgetPlan.create.mockResolvedValue(duplicatedPlan);

      const req = {
        params: { month: "2026-05" },
        user: { _id: "u1", householdId: "house1" },
      };
      const res = createMockRes();

      await duplicateBudgetPlan(req, res);

      expect(BudgetPlan.create).toHaveBeenCalledWith({
        householdId: "house1",
        month: "2026-05",
        createdBy: "u1",
        categories: [{ name: "Rent", amount: 10000 }],
        split: { mode: "equal", percentMore: 0 },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Household budget duplicated from previous month",
        plan: duplicatedPlan,
      });
    });
  });
});
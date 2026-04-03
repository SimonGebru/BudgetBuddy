import {
  upsertPersonalBudgetPlan,
  getPersonalBudgetSummary,
  getPersonalBudgetHistory,
  duplicatePersonalBudgetPlan,
} from "../controllers/personalBudgetController.js";
import PersonalBudgetPlan from "../models/PersonalBudgetPlan.js";

jest.mock("../models/PersonalBudgetPlan.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  },
}));

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("personalBudgetController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertPersonalBudgetPlan", () => {
    it("should return 400 if month is invalid", async () => {
      const req = {
        body: {
          month: "04-2026",
          incomes: [],
          expenses: [],
        },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await upsertPersonalBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "month is required in YYYY-MM format",
      });
    });

    it("should return 400 if incomes is not an array", async () => {
      const req = {
        body: {
          month: "2026-04",
          incomes: "not-array",
          expenses: [],
        },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await upsertPersonalBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "incomes must be an array",
      });
    });

    it("should return 400 if expenses is not an array", async () => {
      const req = {
        body: {
          month: "2026-04",
          incomes: [],
          expenses: "not-array",
        },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await upsertPersonalBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "expenses must be an array",
      });
    });

    it("should return 200 and not save if budget is empty and no existing plan exists", async () => {
      PersonalBudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const req = {
        body: {
          month: "2026-04",
          incomes: [],
          expenses: [],
        },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await upsertPersonalBudgetPlan(req, res);

      expect(PersonalBudgetPlan.findOne).toHaveBeenCalledWith({
        userId: "user1",
        month: "2026-04",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "No personal budget data to save",
        plan: null,
      });
    });

    it("should delete existing plan and return 200 if budget is empty", async () => {
      PersonalBudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "plan1" }),
      });
      PersonalBudgetPlan.findByIdAndDelete.mockResolvedValue({});

      const req = {
        body: {
          month: "2026-04",
          incomes: [],
          expenses: [],
        },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await upsertPersonalBudgetPlan(req, res);

      expect(PersonalBudgetPlan.findByIdAndDelete).toHaveBeenCalledWith("plan1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Personal budget cleared",
        plan: null,
      });
    });

    it("should save personal budget and return 201", async () => {
      const savedPlan = {
        _id: "plan1",
        month: "2026-04",
        incomes: [{ name: "Salary", amount: 10000 }],
        expenses: [{ name: "Rent", amount: 5000 }],
      };

      PersonalBudgetPlan.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(savedPlan),
      });

      const req = {
        body: {
          month: "2026-04",
          incomes: [{ name: " Salary ", amount: "10000" }],
          expenses: [{ name: "Rent", amount: 5000 }],
        },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await upsertPersonalBudgetPlan(req, res);

      expect(PersonalBudgetPlan.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Personal budget saved",
        plan: savedPlan,
      });
    });
  });

  describe("getPersonalBudgetSummary", () => {
    it("should return 400 for invalid month", async () => {
      const req = {
        params: { month: "04-2026" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await getPersonalBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if plan is not found", async () => {
      PersonalBudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const req = {
        params: { month: "2026-04" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await getPersonalBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
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

      const req = {
        params: { month: "2026-04" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await getPersonalBudgetSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "plan1",
        month: "2026-04",
        incomes: [{ id: "i1", name: "Salary", amount: 10000 }],
        expenses: [{ id: "e1", name: "Rent", amount: 6000 }],
        totalIncome: 10000,
        totalExpenses: 6000,
        remaining: 4000,
      });
    });
  });

  describe("getPersonalBudgetHistory", () => {
    it("should return history", async () => {
      PersonalBudgetPlan.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: "plan1",
              month: "2026-04",
              incomes: [{ _id: "i1", name: "Salary", amount: 10000 }],
              expenses: [{ _id: "e1", name: "Rent", amount: 6000 }],
            },
          ]),
        }),
      });

      const req = {
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await getPersonalBudgetHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        history: [
          {
            id: "plan1",
            month: "2026-04",
            incomes: [{ id: "i1", name: "Salary", amount: 10000 }],
            expenses: [{ id: "e1", name: "Rent", amount: 6000 }],
            totalIncome: 10000,
            totalExpenses: 6000,
            remaining: 4000,
          },
        ],
      });
    });
  });

  describe("duplicatePersonalBudgetPlan", () => {
    it("should return 400 for invalid month", async () => {
      const req = {
        params: { month: "04-2026" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await duplicatePersonalBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 409 if target month already exists", async () => {
      PersonalBudgetPlan.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "existing" }),
      });

      const req = {
        params: { month: "2026-05" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await duplicatePersonalBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Conflict",
        message: "A personal budget already exists for this month",
      });
    });

    it("should return 404 if previous month budget is missing", async () => {
      PersonalBudgetPlan.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        });

      const req = {
        params: { month: "2026-05" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await duplicatePersonalBudgetPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "NotFound",
        message: "No personal budget found for previous month",
      });
    });

    it("should duplicate previous month budget and return 201", async () => {
      const previousPlan = {
        incomes: [{ name: "Salary", amount: 10000 }],
        expenses: [{ name: "Rent", amount: 6000 }],
      };

      const duplicatedPlan = {
        _id: "newPlan",
        userId: "user1",
        month: "2026-05",
        incomes: [{ name: "Salary", amount: 10000 }],
        expenses: [{ name: "Rent", amount: 6000 }],
      };

      PersonalBudgetPlan.findOne
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(null),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(previousPlan),
        });

      PersonalBudgetPlan.create.mockResolvedValue(duplicatedPlan);

      const req = {
        params: { month: "2026-05" },
        user: { _id: "user1" },
      };
      const res = createMockRes();

      await duplicatePersonalBudgetPlan(req, res);

      expect(PersonalBudgetPlan.create).toHaveBeenCalledWith({
        userId: "user1",
        month: "2026-05",
        incomes: [{ name: "Salary", amount: 10000 }],
        expenses: [{ name: "Rent", amount: 6000 }],
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Personal budget duplicated from previous month",
        plan: duplicatedPlan,
      });
    });
  });
});
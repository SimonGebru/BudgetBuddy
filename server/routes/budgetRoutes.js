import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  upsertBudgetPlan,
  getBudgetSummary,
  updateBudgetSplit,
} from "../controllers/budgetController.js";

const router = Router();

// skydda alla budget-routes
router.use(requireAuth);

// Skapa / uppdatera budgetplan för en månad
router.post("/plans", upsertBudgetPlan);

// Hämta summary för en månad
router.get("/plans/:month/summary", getBudgetSummary);

// Byt split-läge för en månad
router.patch("/plans/:month/split", updateBudgetSplit);

export default router;

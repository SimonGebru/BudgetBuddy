import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  upsertBudgetPlan,
  getBudgetSummary,
  updateBudgetSplit,
  getBudgetHistory,
  duplicateBudgetPlan,
} from "../controllers/budgetController.js";

const router = Router();

// skydda alla budget-routes
router.use(requireAuth);

// Hämta historik/statistik för flera månader
router.get("/history", getBudgetHistory);

// Skapa / uppdatera budgetplan för en månad
router.post("/plans", upsertBudgetPlan);

// Hämta summary för en månad
router.get("/plans/:month/summary", getBudgetSummary);

// Byt split-läge för en månad
router.patch("/plans/:month/split", updateBudgetSplit);
// Duplicera en budgetplan från en månad till en annan
router.post("/plans/:month/duplicate", duplicateBudgetPlan);

export default router;

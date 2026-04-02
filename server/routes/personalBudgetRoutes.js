import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  upsertPersonalBudgetPlan,
  getPersonalBudgetSummary,
  getPersonalBudgetHistory,
  duplicatePersonalBudgetPlan,
} from "../controllers/personalBudgetController.js";

const router = Router();

router.use(requireAuth);

router.post("/plans", upsertPersonalBudgetPlan);
router.get("/plans/:month", getPersonalBudgetSummary);
router.get("/history", getPersonalBudgetHistory);

router.post("/plans/:month/duplicate", duplicatePersonalBudgetPlan);

export default router;
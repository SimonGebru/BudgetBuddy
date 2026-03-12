import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createHousehold,
  joinHousehold,
  getMyHousehold,
  updateMyIncome,
} from "../controllers/householdController.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyHousehold);
router.post("/create", createHousehold);
router.post("/join", joinHousehold);
router.patch("/income", updateMyIncome);

export default router;
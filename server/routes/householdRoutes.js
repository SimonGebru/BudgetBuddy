import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createHousehold,
  joinHousehold,
  getMyHousehold,
  updateMyIncome,
  leaveHousehold,
} from "../controllers/householdController.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyHousehold);
router.post("/create", createHousehold);
router.post("/join", joinHousehold);
router.patch("/income", updateMyIncome);
router.post("/leave", leaveHousehold);

export default router;
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createHousehold, joinHousehold, getMyHousehold } from "../controllers/householdController.js";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyHousehold);
router.post("/create", createHousehold);
router.post("/join", joinHousehold);

export default router;
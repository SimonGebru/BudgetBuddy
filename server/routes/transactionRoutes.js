import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = Router();

// Skydda ALLT
router.use(requireAuth);

router.post("/", createTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
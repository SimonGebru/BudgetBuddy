import Transaction from "../models/Transaction.js";
import {
  buildTransactionFilter,
  normalizeTransactionCategory,
  normalizeTransactionNote,
  parseTransactionAmount,
  parseTransactionDate,
  validateTransactionCreateInput,
  validateTransactionType,
} from "../services/transactionService.js";

/**
 * POST /transactions
 * Body: { type, amount, category, date, note }
 */
export async function createTransaction(req, res) {
  try {
    const result = validateTransactionCreateInput(req.body);
    if (!result.ok) {
      return res.status(400).json(result.error);
    }

    const { type, amount, category, date } = result.data;
    const note = normalizeTransactionNote(req.body.note);

    const tx = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      category,
      date,
      note,
      currency: "SEK",
    });

    return res.status(201).json(tx);
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * GET /transactions
 * Query: from, to, type, category, month
 */
export async function getTransactions(req, res) {
  try {
    const filterResult = buildTransactionFilter(req.user._id, req.query);
    if (!filterResult.ok) {
      return res.status(400).json(filterResult.error);
    }

    const transactions = await Transaction.find(filterResult.filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return res.status(200).json(transactions);
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * PUT /transactions/:id
 */
export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { type, amount, category, date, note } = req.body;

    const tx = await Transaction.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!tx) {
      return res.status(404).json({
        error: "NotFound",
        message: "Transaction not found",
      });
    }

    if (type !== undefined) {
      const typeResult = validateTransactionType(type);
      if (!typeResult.ok) {
        return res.status(400).json(typeResult.error);
      }

      tx.type = type;
    }

    if (amount !== undefined) {
      const amountResult = parseTransactionAmount(amount);
      if (!amountResult.ok) {
        return res.status(400).json(amountResult.error);
      }

      tx.amount = amountResult.amount;
    }

    if (category !== undefined) {
      const categoryResult = normalizeTransactionCategory(category);
      if (!categoryResult.ok) {
        return res.status(400).json(categoryResult.error);
      }

      tx.category = categoryResult.category;
    }

    if (date !== undefined) {
      const dateResult = parseTransactionDate(date);
      if (!dateResult.ok) {
        return res.status(400).json(dateResult.error);
      }

      tx.date = dateResult.date;
    }

    if (note !== undefined) {
      tx.note = normalizeTransactionNote(note);
    }

    await tx.save();

    return res.status(200).json(tx);
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

/**
 * DELETE /transactions/:id
 */
export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    const tx = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!tx) {
      return res.status(404).json({
        error: "NotFound",
        message: "Transaction not found",
      });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}
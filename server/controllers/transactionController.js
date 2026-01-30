import Transaction from "../models/Transaction.js";

/**
 * POST /transactions
 * Body: { type, amount, category, date, note }
 */
export async function createTransaction(req, res) {
  try {
    const { type, amount, category, date, note } = req.body;

    if (!req.user.householdId) {
      return res.status(400).json({
        error: "HouseholdMissing",
        message: "User is not connected to a household yet",
      });
    }

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        error: "ValidationError",
        message: "type, amount, category and date are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        error: "ValidationError",
        message: 'type must be "income" or "expense"',
      });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: "ValidationError",
        message: "amount must be a number greater than 0",
      });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        error: "ValidationError",
        message: "date must be a valid date",
      });
    }

    const tx = await Transaction.create({
      householdId: req.user.householdId,
      createdBy: req.user._id,
      type,
      amount: parsedAmount,
      category: String(category).trim(),
      date: parsedDate,
      note: note ? String(note).trim() : "",
      currency: "SEK",
    });

    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
}

/**
 * GET /transactions
 * Query: from, to, type, category
 */
export async function getTransactions(req, res) {
  try {
    if (!req.user.householdId) {
      return res.status(400).json({
        error: "HouseholdMissing",
        message: "User is not connected to a household yet",
      });
    }

    const { from, to, type, category } = req.query;

    const filter = {
      householdId: req.user.householdId,
    };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          error: "ValidationError",
          message: 'type must be "income" or "expense"',
        });
      }
      filter.type = type;
    }

    if (category) {
      filter.category = String(category).trim();
    }

    if (from || to) {
      filter.date = {};
      if (from) {
        const d = new Date(from);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({
            error: "ValidationError",
            message: "from must be a valid date",
          });
        }
        filter.date.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({
            error: "ValidationError",
            message: "to must be a valid date",
          });
        }
        filter.date.$lte = d;
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .lean();

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
}

/**
 * PUT /transactions/:id
 */
export async function updateTransaction(req, res) {
  try {
    if (!req.user.householdId) {
      return res.status(400).json({
        error: "HouseholdMissing",
        message: "User is not connected to a household yet",
      });
    }

    const { id } = req.params;
    const { type, amount, category, date, note } = req.body;

    const tx = await Transaction.findOne({
      _id: id,
      householdId: req.user.householdId,
    });

    if (!tx) {
      return res.status(404).json({
        error: "NotFound",
        message: "Transaction not found",
      });
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          error: "ValidationError",
          message: 'type must be "income" or "expense"',
        });
      }
      tx.type = type;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          error: "ValidationError",
          message: "amount must be a number greater than 0",
        });
      }
      tx.amount = parsedAmount;
    }

    if (category !== undefined) {
      const c = String(category).trim();
      if (!c) {
        return res.status(400).json({
          error: "ValidationError",
          message: "category cannot be empty",
        });
      }
      tx.category = c;
    }

    if (date !== undefined) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({
          error: "ValidationError",
          message: "date must be a valid date",
        });
      }
      tx.date = d;
    }

    if (note !== undefined) {
      tx.note = String(note).trim();
    }

    await tx.save();

    res.status(200).json(tx);
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
}

/**
 * DELETE /transactions/:id
 */
export async function deleteTransaction(req, res) {
  try {
    if (!req.user.householdId) {
      return res.status(400).json({
        error: "HouseholdMissing",
        message: "User is not connected to a household yet",
      });
    }

    const { id } = req.params;

    const tx = await Transaction.findOneAndDelete({
      _id: id,
      householdId: req.user.householdId,
    });

    if (!tx) {
      return res.status(404).json({
        error: "NotFound",
        message: "Transaction not found",
      });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
}
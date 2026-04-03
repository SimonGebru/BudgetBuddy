export function validateTransactionType(type) {
  if (!["income", "expense"].includes(type)) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: 'type must be "income" or "expense"',
      },
    };
  }

  return { ok: true };
}

export function parseTransactionAmount(amount) {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "amount must be a number greater than 0",
      },
    };
  }

  return {
    ok: true,
    amount: parsedAmount,
  };
}

export function parseTransactionDate(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "date must be a valid date",
      },
    };
  }

  return {
    ok: true,
    date: parsedDate,
  };
}

export function normalizeTransactionCategory(category) {
  const trimmedCategory = String(category || "").trim();

  if (!trimmedCategory) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "category cannot be empty",
      },
    };
  }

  return {
    ok: true,
    category: trimmedCategory,
  };
}

export function normalizeTransactionNote(note) {
  return note ? String(note).trim() : "";
}

export function validateTransactionCreateInput({ type, amount, category, date }) {
  const resolvedType = type || "expense";

  const typeResult = validateTransactionType(resolvedType);
  if (!typeResult.ok) return typeResult;

  const amountResult = parseTransactionAmount(amount);
  if (!amountResult.ok) return amountResult;

  const categoryResult = normalizeTransactionCategory(category);
  if (!categoryResult.ok) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "amount, category and date are required",
      },
    };
  }

  const dateResult = parseTransactionDate(date);
  if (!dateResult.ok) return dateResult;

  if (amount === undefined || !date) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "amount, category and date are required",
      },
    };
  }

  return {
    ok: true,
    data: {
      type: resolvedType,
      amount: amountResult.amount,
      category: categoryResult.category,
      date: dateResult.date,
    },
  };
}

export function buildTransactionFilter(userId, query = {}) {
  const { from, to, type, category, month } = query;

  const filter = {
    userId,
  };

  if (type) {
    const typeResult = validateTransactionType(type);
    if (!typeResult.ok) return typeResult;

    filter.type = type;
  }

  if (category) {
    filter.category = String(category).trim();
  }

  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return {
        ok: false,
        error: {
          error: "ValidationError",
          message: "month must be in YYYY-MM format",
        },
      };
    }

    const [year, monthNumber] = month.split("-").map(Number);
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 1);

    filter.date = {
      ...filter.date,
      $gte: startDate,
      $lt: endDate,
    };
  }

  if (from) {
    const fromResult = parseTransactionDate(from);
    if (!fromResult.ok) {
      return {
        ok: false,
        error: {
          error: "ValidationError",
          message: "from must be a valid date",
        },
      };
    }

    filter.date = {
      ...filter.date,
      $gte: fromResult.date,
    };
  }

  if (to) {
    const toResult = parseTransactionDate(to);
    if (!toResult.ok) {
      return {
        ok: false,
        error: {
          error: "ValidationError",
          message: "to must be a valid date",
        },
      };
    }

    filter.date = {
      ...filter.date,
      $lte: toResult.date,
    };
  }

  return {
    ok: true,
    filter,
  };
}
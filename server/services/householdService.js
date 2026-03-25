export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function validateIncomeInput(value, fieldName = "monthlyIncome") {
  const incomeNumber = Number(value);

  if (!Number.isFinite(incomeNumber) || incomeNumber < 0) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: `${fieldName} must be a number >= 0`,
      },
    };
  }

  return {
    ok: true,
    value: incomeNumber,
  };
}

export function upsertIncomeHistoryEntry(member, month, amount) {
  const existingIncomeEntry = member.incomeHistory?.find(
    (entry) => entry.month === month
  );

  // Finns månaden redan uppdateras posten, annars skapas en ny.
  if (existingIncomeEntry) {
    existingIncomeEntry.amount = amount;
  } else {
    member.incomeHistory.push({
      month,
      amount,
    });
  }
}

export function toHouseholdResponse(household) {
  return {
    id: household._id,
    name: household.name,
    members: household.members.map((member) => ({
      userId: member.userId?._id,
      name: member.userId?.name || "Unknown",
      email: member.userId?.email || "",
      monthlyIncome: member.monthlyIncome,
      incomeHistory: member.incomeHistory || [],
    })),
  };
}
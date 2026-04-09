const DEFAULT_SPLIT = {
  mode: "income",
  percentMore: 0,
};

export function roundMoney(n) {
  // Rundar till heltal så att summor blir enklare att visa och jämföra i budgeten.
  return Math.round(Number(n) || 0);
}

export function getIncomeForMonth(member, month) {
  const history = Array.isArray(member.incomeHistory) ? member.incomeHistory : [];

  const match = history.find((entry) => entry.month === month);

  // Om det finns ett sparat värde för just den månaden används det,
  // annars faller vi tillbaka på användarens vanliga månadsinkomst.
  if (match) {
    return Number(match.amount) || 0;
  }

  return Number(member.monthlyIncome) || 0;
}

export function validateSplit(split) {
  const mode = split?.mode || DEFAULT_SPLIT.mode;
  const percentMore = Number(split?.percentMore || 0);

  if (!["income", "equal", "topEarnsMore"].includes(mode)) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: 'split.mode must be "income", "equal" or "topEarnsMore"',
      },
    };
  }

  if (
    mode === "topEarnsMore" &&
    (!Number.isFinite(percentMore) || percentMore < 0 || percentMore > 200)
  ) {
    return {
      ok: false,
      error: {
        error: "ValidationError",
        message: "split.percentMore must be a number between 0 and 200",
      },
    };
  }

  return {
    ok: true,
    split: {
      mode,
      percentMore: mode === "topEarnsMore" ? percentMore : 0,
    },
  };
}

export function calcWeights({ mode, percentMore }, members, month) {
  if (!Array.isArray(members) || members.length === 0) {
    return [];
  }

  // ✅ SOLO MODE
  if (members.length === 1) {
    const member = members[0];

    return [
      {
        userId: member.userId._id?.toString?.() || member.userId.toString(),
        name: member.userId.name,
        monthlyIncome: getIncomeForMonth(member, month),
        weight: 1,
      },
    ];
  }

  const incomes = members.map((member) => ({
    userId: member.userId._id?.toString?.() || member.userId.toString(),
    name: member.userId.name,
    monthlyIncome: getIncomeForMonth(member, month),
  }));

  if (mode === "equal") {
    const weight = 1 / incomes.length;
    return incomes.map((person) => ({ ...person, weight }));
  }

  if (mode === "topEarnsMore") {
    const ratio = 1 + (Number(percentMore) || 0) / 100;

    const sorted = [...incomes].sort((a, b) => b.monthlyIncome - a.monthlyIncome);
    const top = sorted[0];
    const other = sorted[1];

    if (top.monthlyIncome === other.monthlyIncome) {
      const weight = 1 / incomes.length;
      return incomes.map((person) => ({ ...person, weight }));
    }

    const topWeight = ratio / (ratio + 1);
    const otherWeight = 1 / (ratio + 1);

    return incomes.map((person) => {
      if (person.userId === top.userId) return { ...person, weight: topWeight };
      if (person.userId === other.userId) return { ...person, weight: otherWeight };
      return { ...person, weight: 0 };
    });
  }

  const totalIncome = incomes.reduce((sum, person) => sum + person.monthlyIncome, 0);

  if (totalIncome <= 0) {
    const weight = 1 / incomes.length;
    return incomes.map((person) => ({ ...person, weight }));
  }

  return incomes.map((person) => ({
    ...person,
    weight: person.monthlyIncome / totalIncome,
  }));
}

export function getTotalBudget(categories) {
  return categories.reduce((sum, category) => sum + (Number(category.amount) || 0), 0);
}

export function buildPeopleSummary(peopleWithWeights, totalBudget) {
  return peopleWithWeights.map((person) => ({
    userId: person.userId,
    name: person.name,
    monthlyIncome: person.monthlyIncome,
    weight: Number(person.weight.toFixed(4)),
    contributionTotal: roundMoney(totalBudget * person.weight),
  }));
}

export function buildCategorySummary(planCategories, peopleWithWeights) {
  return planCategories.map((category) => {
    const perPersonRaw = peopleWithWeights.map((person) => ({
      userId: person.userId,
      name: person.name,
      amount: roundMoney((Number(category.amount) || 0) * person.weight),
    }));

    // Efter avrundning kan det skilja någon krona, så här justeras det så att summan
    // faktiskt matchar kategorins totalbelopp.
    const categoryAmount = roundMoney(category.amount);
    const sumRounded = perPersonRaw.reduce((sum, item) => sum + item.amount, 0);
    const diff = categoryAmount - sumRounded;

    // Diffen läggs på personen med högst vikt för att få en stabil och förutsägbar fördelning.
    if (diff !== 0) {
      let indexToAdjust = 0;
      let bestWeight = -Infinity;

      perPersonRaw.forEach((person, index) => {
        const weight =
          peopleWithWeights.find((item) => item.userId === person.userId)?.weight ?? 0;

        if (weight > bestWeight) {
          bestWeight = weight;
          indexToAdjust = index;
        }
      });

      perPersonRaw[indexToAdjust].amount += diff;
    }

    return {
      name: category.name,
      amount: categoryAmount,
      perPerson: perPersonRaw,
    };
  });
}

export function getDefaultSplit() {
  return DEFAULT_SPLIT;
}
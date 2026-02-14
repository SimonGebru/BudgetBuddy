
export const mockCurrentUser = {
  id: 'user-1',
  name: 'Alex',
  email: 'alex@example.com',
  householdId: 'household-1',
};


export const mockPartner = {
  id: 'user-2',
  name: 'Sam',
  email: 'sam@example.com',
  householdId: 'household-1',
};


export const mockHousehold = {
  id: 'household-1',
  name: 'Alex & Sam',
  members: [
    { userId: 'user-1', name: 'Alex', monthlyIncome: 45000 },
    { userId: 'user-2', name: 'Sam', monthlyIncome: 35000 },
  ],
};


export const mockBudgetSummary = {
  householdId: 'household-1',
  month: '2025-01',
  split: {
    mode: 'income',
    percentMore: 20,
  },
  totalBudget: 28500,
  totalIncome: 80000,
  people: [
    {
      userId: 'user-1',
      name: 'Alex',
      monthlyIncome: 45000,
      weight: 0.5625, // 45000/80000
      contributionTotal: 16031,
    },
    {
      userId: 'user-2',
      name: 'Sam',
      monthlyIncome: 35000,
      weight: 0.4375, // 35000/80000
      contributionTotal: 12469,
    },
  ],
  categories: [
    {
      id: 'cat-1',
      name: 'Rent',
      amount: 12000,
      perPerson: [
        { userId: 'user-1', name: 'Alex', amount: 6750 },
        { userId: 'user-2', name: 'Sam', amount: 5250 },
      ],
    },
    {
      id: 'cat-2',
      name: 'Groceries',
      amount: 5000,
      perPerson: [
        { userId: 'user-1', name: 'Alex', amount: 2813 },
        { userId: 'user-2', name: 'Sam', amount: 2187 },
      ],
    },
    {
      id: 'cat-3',
      name: 'Utilities',
      amount: 2500,
      perPerson: [
        { userId: 'user-1', name: 'Alex', amount: 1406 },
        { userId: 'user-2', name: 'Sam', amount: 1094 },
      ],
    },
    {
      id: 'cat-4',
      name: 'Insurance',
      amount: 3000,
      perPerson: [
        { userId: 'user-1', name: 'Alex', amount: 1688 },
        { userId: 'user-2', name: 'Sam', amount: 1312 },
      ],
    },
    {
      id: 'cat-5',
      name: 'Entertainment',
      amount: 3000,
      perPerson: [
        { userId: 'user-1', name: 'Alex', amount: 1688 },
        { userId: 'user-2', name: 'Sam', amount: 1312 },
      ],
    },
    {
      id: 'cat-6',
      name: 'Savings',
      amount: 3000,
      perPerson: [
        { userId: 'user-1', name: 'Alex', amount: 1688 },
        { userId: 'user-2', name: 'Sam', amount: 1312 },
      ],
    },
  ],
};


export const emptyBudgetSummary = {
  householdId: 'household-1',
  month: '',
  split: {
    mode: 'income',
    percentMore: 20,
  },
  totalBudget: 0,
  totalIncome: 80000,
  people: [
    {
      userId: 'user-1',
      name: 'Alex',
      monthlyIncome: 45000,
      weight: 0.5625,
      contributionTotal: 0,
    },
    {
      userId: 'user-2',
      name: 'Sam',
      monthlyIncome: 35000,
      weight: 0.4375,
      contributionTotal: 0,
    },
  ],
  categories: [],
};


export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};


export const formatMonth = (month) => {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
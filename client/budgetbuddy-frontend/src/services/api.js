

import {
  mockCurrentUser,
  mockBudgetSummary,
  mockHousehold,
  emptyBudgetSummary,
} from '@/data/mockData';


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AUTH ENDPOINTS
 */


export async function login(email, password) {
  await delay(800);
  
  if (email && password) {
    return mockCurrentUser;
  }
  throw new Error('Invalid credentials');
}


export async function register(name, email, password) {
  await delay(800);
  
  return { ...mockCurrentUser, name, email, householdId: undefined };
}


export async function logout() {
  await delay(300);
}


export async function getCurrentUser() {
  await delay(300);
  
  return mockCurrentUser;
}

/**
 * HOUSEHOLD ENDPOINTS
 */


export async function createHousehold(name, monthlyIncome) {
  await delay(800);
  
  return {
    id: 'new-household',
    name,
    members: [{ userId: mockCurrentUser.id, name: mockCurrentUser.name, monthlyIncome }],
  };
}


export async function joinHousehold(householdId, monthlyIncome) {
  await delay(800);
  
  return mockHousehold;
}


export async function getHousehold(householdId) {
  await delay(300);
  
  return mockHousehold;
}

/**
 * BUDGET ENDPOINTS
 */


export async function getBudgetSummary(month) {
  await delay(500);
  
  
  if (month === '2025-01') {
    return mockBudgetSummary;
  }
  return { ...emptyBudgetSummary, month };
}


export async function saveBudgetPlan(month, categories) {
  await delay(800);
  
  console.log('Saving budget:', { month, categories });
  return mockBudgetSummary;
}


export async function updateSplitMode(month, split) {
  await delay(300);
  
  return { ...mockBudgetSummary, split };
}

/**
 * USER ENDPOINTS
 */


export async function updateProfile(data) {
  await delay(500);
  
  return { ...mockCurrentUser, ...data };
}


export async function updateIncome(monthlyIncome) {
  await delay(500);
  
  console.log('Updated income:', monthlyIncome);
}
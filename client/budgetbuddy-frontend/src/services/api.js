const BASE_URL = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

function setStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getStoredUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function removeStoredUser() {
  localStorage.removeItem("user");
}

// Hämtar användarens default split mode från localStorage
function getDefaultSplitFromUser() {
  const user = getStoredUser();
  const mode = user?.defaultSplitMode || "equal";

  return {
    mode,
    percentMore: 0,
  };
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    signal: controller.signal,
  });

  clearTimeout(timeout);

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    removeToken();
    removeStoredUser();
  }

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * AUTH
 */

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);
  setStoredUser(data.user);

  return data.user;
}

export async function register(name, email, password) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  setToken(data.token);
  setStoredUser(data.user);

  return data.user;
}

export async function logout() {
  removeToken();
  removeStoredUser();
}

export async function getCurrentUser() {
  const data = await request("/auth/me", {
    method: "GET",
  });

  setStoredUser(data.user);
  return data.user;
}

export async function updateMe(updates) {
  const data = await request("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  setStoredUser(data.user);
  return data.user;
}

/**
 * HOUSEHOLD
 */

export async function createHousehold(name, monthlyIncome) {
  const data = await request("/household/create", {
    method: "POST",
    body: JSON.stringify({ name, monthlyIncome }),
  });

  const currentUser = getStoredUser();
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      householdId: data.householdId,
    };
    setStoredUser(updatedUser);
  }

  return {
    id: data.householdId,
    householdId: data.householdId,
    message: data.message,
  };
}

export async function joinHousehold(householdId, monthlyIncome) {
  const data = await request("/household/join", {
    method: "POST",
    body: JSON.stringify({ householdId, monthlyIncome }),
  });

  const currentUser = getStoredUser();
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      householdId: data.householdId,
    };
    setStoredUser(updatedUser);
  }

  return data;
}

export async function leaveHousehold() {
  const data = await request("/household/leave", {
    method: "POST",
  });

  const currentUser = getStoredUser();
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      householdId: null,
    };
    setStoredUser(updatedUser);
  }

  return data;
}

export async function getMyHousehold() {
  const data = await request("/household/me", {
    method: "GET",
  });

  return data.household;
}

export async function updateMyIncome(month, amount) {
  return request("/household/income", {
    method: "PATCH",
    body: JSON.stringify({ month, amount }),
  });
}

/**
 * BUDGET
 */

export async function getBudgetSummary(month) {
  try {
    return await request(`/budget/plans/${month}/summary`, {
      method: "GET",
    });
  } catch (error) {
    // Om det ännu inte finns någon budget för månaden returneras en tom standardstruktur
    if (error.message === "Budget plan not found for month") {
      return {
        month,
        split: getDefaultSplitFromUser(),
        totalBudget: 0,
        totalIncome: 0,
        people: [],
        categories: [],
      };
    }

    throw error;
  }
}

export async function getBudgetHistory() {
  const data = await request("/budget/history", {
    method: "GET",
  });

  return data.history;
}

export async function saveBudgetPlan(
  month,
  categories,
  split = getDefaultSplitFromUser()
) {
  return request("/budget/plans", {
    method: "POST",
    body: JSON.stringify({ month, categories, split }),
  });
}

export async function updateSplitMode(month, splitMode) {
  const split =
    typeof splitMode === "string"
      ? { mode: splitMode, percentMore: 0 }
      : splitMode;

  return request(`/budget/plans/${month}/split`, {
    method: "PATCH",
    body: JSON.stringify({ split }),
  });
}

/**
 * USER STATE HELPERS
 */

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getAuthToken() {
  return getToken();
}
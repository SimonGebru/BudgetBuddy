
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password) {
  await wait(400);

  if (!email || !password) throw new Error("Missing credentials");

  const user = {
    id: "user_1",
    name: "Simon",
    email,
    householdId: null, 
  };

  localStorage.setItem("bb_user", JSON.stringify(user));
  return user;
}

export async function register(name, email, password) {
  await wait(500);

  if (!name || !email || !password) throw new Error("Missing fields");

  // spara "ny user"
  const user = { id: "user_1", name, email, householdId: null };
  localStorage.setItem("bb_user", JSON.stringify(user));
  return user;
}

export async function getBudgetSummary(month) {
  await wait(400);

  // Minimal "budget shape" som Dashboard förväntar sig
  return {
    month,
    split: "income", // eller "equal"
    categories: [
      { id: "cat_1", name: "Rent", planned: 12000 },
      { id: "cat_2", name: "Food", planned: 4500 },
      { id: "cat_3", name: "Savings", planned: 3000 },
    ],
  };
}

export async function updateSplitMode(month, split) {
  await wait(200);
  return { month, split };
}
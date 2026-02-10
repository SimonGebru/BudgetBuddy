
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
import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");

  return jwt.sign(payload, secret, { expiresIn: "2h" });
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");

  return jwt.verify(token, secret);
}
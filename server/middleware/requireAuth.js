import User from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header",
      });
    }

    const decoded = verifyAccessToken(token);

    // Hämta user (utan passwordHash)
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found",
      });
    }

    req.user = user; 
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}
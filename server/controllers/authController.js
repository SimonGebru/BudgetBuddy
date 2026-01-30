import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "ValidationError",
        message: "name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "ValidationError",
        message: "password must be at least 6 characters",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email is already in use",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      householdId: null,
    });

    const token = signAccessToken({ userId: user._id.toString() });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        householdId: user.householdId,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "ValidationError",
        message: "email and password are required",
      });
    }

    // select("+passwordHash") eftersom jag satte select:false i schema
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordHash"
    );

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    const token = signAccessToken({ userId: user._id.toString() });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        householdId: user.householdId,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "ServerError", message: err.message });
  }
}
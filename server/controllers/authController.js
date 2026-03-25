import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function toSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    householdId: user.householdId,
    defaultSplitMode: user.defaultSplitMode,
  };
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Enkel validering direkt i controllern innan vi går vidare.
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "ValidationError",
        message: "name, email and password are required",
      });
    }

    // Grundkrav för lösenord så att vi inte sparar alltför svaga lösenord.
    if (password.length < 6) {
      return res.status(400).json({
        error: "ValidationError",
        message: "password must be at least 6 characters",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // Jag normaliserar e-post till lowercase så att samma adress inte kan registreras flera gånger med olika versaler.
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email is already in use",
      });
    }

    // Lösenord sparas aldrig i klartext utan hashas innan användaren skapas.
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      householdId: null,
    });

    // När användaren registrerats skapas en access token direkt så att användaren kan vara inloggad direkt efter signup.
    const token = signAccessToken({ userId: user._id.toString() });

    return res.status(201).json({
      user: toSafeUser(user),
      token,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Login kräver bara e-post och lösenord.
    if (!email || !password) {
      return res.status(400).json({
        error: "ValidationError",
        message: "email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // passwordHash är exkluderad i schemat som standard, så här väljer jag in den uttryckligen.
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );

    // Samma felmeddelande används både för fel e-post och fel lösenord.
    // Det gör att man inte avslöjar vad som faktiskt var fel.
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

    // Vid lyckad login skickas en ny token tillbaka tillsammans med grundläggande användardata.
    const token = signAccessToken({ userId: user._id.toString() });

    return res.status(200).json({
      user: toSafeUser(user),
      token,
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

export async function me(req, res) {
  try {
    // req.user sätts i auth-middleware efter att token verifierats.
    return res.status(200).json({
      user: toSafeUser(req.user),
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, email, defaultSplitMode } = req.body;

    const updates = {};

    if (typeof name !== "undefined") {
      const trimmedName = String(name).trim();

      // Tillåter inte att namn uppdateras till tom sträng.
      if (!trimmedName) {
        return res.status(400).json({
          error: "ValidationError",
          message: "name cannot be empty",
        });
      }

      updates.name = trimmedName;
    }

    if (typeof email !== "undefined") {
      const normalizedEmail = normalizeEmail(email);

      // E-post får inte heller bli tom vid uppdatering.
      if (!normalizedEmail) {
        return res.status(400).json({
          error: "ValidationError",
          message: "email cannot be empty",
        });
      }

      // Kollar att den nya e-posten inte redan används av någon annan användare.
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });

      if (existing) {
        return res.status(409).json({
          error: "Conflict",
          message: "Email is already in use",
        });
      }

      updates.email = normalizedEmail;
    }

    // Den här delen gör att bara tillåtna värden kan sparas för standardvalet av split mode.
    if (typeof defaultSplitMode !== "undefined") {
      if (!["income", "equal", "topEarnsMore"].includes(defaultSplitMode)) {
        return res.status(400).json({
          error: "ValidationError",
          message: 'defaultSplitMode must be "income", "equal" or "topEarnsMore"',
        });
      }

      updates.defaultSplitMode = defaultSplitMode;
    }

    // Om inget giltigt skickades in ska ingen tom uppdatering göras.
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "ValidationError",
        message: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "User updated",
      user: toSafeUser(updatedUser),
    });
  } catch (err) {
    return res.status(500).json({
      error: "ServerError",
      message: err.message,
    });
  }
}
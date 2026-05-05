// ================================
// DESIGRAF AUTH SYSTEM (JWT)
// ================================

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = process.env.JWT_SECRET || "DESIGRAF_SECRET_KEY";

// =========================
// HASH PASSWORD
// =========================
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// =========================
// COMPARE PASSWORD
// =========================
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// =========================
// GENERATE TOKEN
// =========================
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role || "user"
    },
    SECRET,
    { expiresIn: "7d" }
  );
}

// =========================
// VERIFY TOKEN MIDDLEWARE
// =========================
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// =========================
// ROLE CHECK
// =========================
function roleMiddleware(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authMiddleware,
  roleMiddleware
};
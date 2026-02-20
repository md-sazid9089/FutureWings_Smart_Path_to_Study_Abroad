import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const DUMMY_USERS = [
  { id: 1, email: "demo@futurewings.com", password: "demo123", role: "USER", fullname: "Demo User" },
  { id: 2, email: "admin@futurewings.com", password: "admin123", role: "ADMIN", fullname: "Admin User" },
];

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  const user = DUMMY_USERS.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, role: user.role, fullname: user.fullname },
    },
    error: null,
  });
}

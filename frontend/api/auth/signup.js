import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let nextId = 100;

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { email, password, fullname } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  const id = nextId++;
  const normalizedEmail = email.trim().toLowerCase();
  const token = jwt.sign({ userId: id, role: "USER" }, JWT_SECRET, { expiresIn: "7d" });

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: { id, email: normalizedEmail, role: "USER", fullname: fullname || null },
    },
    error: null,
  });
}

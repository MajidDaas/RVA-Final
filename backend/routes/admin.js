import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default function adminRouter(prisma) {
  const router = Router();
  const JWT_SECRET = process.env.JWT_SECRET;

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  });

  router.get("/votes", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing auth" });
    const token = authHeader.split(" ")[1];

    try {
      jwt.verify(token, JWT_SECRET);
      const votes = await prisma.vote.findMany();
      res.json(votes);
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  return router;
}


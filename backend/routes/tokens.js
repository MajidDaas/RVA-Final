import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export default function tokenRouter(prisma) {
  const router = Router();
  const JWT_SECRET = process.env.JWT_SECRET;

  router.post("/generate", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing auth" });
    const token = authHeader.split(" ")[1];
    try {
      jwt.verify(token, JWT_SECRET);

      const { count = 10 } = req.body;
      const codes = [];
      for (let i = 0; i < count; i++) {
        const code = uuidv4();
        await prisma.token.create({ data: { code } });
        codes.push(code);
      }

      res.json({ codes });
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  return router;
}


import { Router } from "express";

export default function voteRouter(prisma) {
  const router = Router();

  router.post("/", async (req, res) => {
    const { token, ballot } = req.body;
    if (!token || !ballot) return res.status(400).json({ error: "Missing token or ballot" });

    const t = await prisma.token.findUnique({ where: { code: token } });
    if (!t || t.used) return res.status(400).json({ error: "Invalid or used token" });

    await prisma.vote.create({ data: { token, ballot: JSON.stringify(ballot) } });
    await prisma.token.update({ where: { code: token }, data: { used: true } });

    res.json({ ok: true });
  });

  router.get("/check", async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const t = await prisma.token.findUnique({ where: { code: token } });
    if (!t || t.used) return res.status(400).json({ valid: false });

    res.json({ valid: true });
  });

  return router;
}


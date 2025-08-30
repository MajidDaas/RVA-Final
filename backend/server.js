import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import voteRouter from "./routes/vote.js";
import adminRouter from "./routes/admin.js";
import tokenRouter from "./routes/tokens.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/api/vote", voteRouter(prisma));
app.use("/api/admin", adminRouter(prisma));
app.use("/api/tokens", tokenRouter(prisma));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));


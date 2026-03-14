import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

const tokens = new Set<string>();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (parsed.data.password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  tokens.add(token);

  res.json({ success: true, token });
});

export function verifyToken(token: string): boolean {
  return tokens.has(token);
}

export default router;

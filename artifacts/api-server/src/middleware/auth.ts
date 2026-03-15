import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../routes/auth";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization token required" });
    return;
  }

  const token = authHeader.slice(7);
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  next();
}

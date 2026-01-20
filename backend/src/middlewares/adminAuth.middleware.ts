import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Non autorisé" });

  try {
    jwt.verify(auth.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

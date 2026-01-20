import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyPassword } from "../utils/password";
import { JWT_SECRET } from "../config/jwt";

// ⚠️ Exemple statique (tu peux remplacer par DB)
const ADMIN_LOGIN = "mh_supervisor_92";
const ADMIN_PASSWORD_HASH =
  "$2b$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // bcrypt hash

export async function adminLogin(req: Request, res: Response) {
  const { login, password } = req.body;

  if (login !== ADMIN_LOGIN)
    return res.status(401).json({ error: "Accès refusé" });

  const valid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  if (!valid)
    return res.status(401).json({ error: "Accès refusé" });

  const token = jwt.sign(
    { role: "admin" },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
}

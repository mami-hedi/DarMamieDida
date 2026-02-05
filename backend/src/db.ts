import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  // On utilise les variables d'environnement ou les valeurs locales par défaut
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "DarMamieDida",
  port: Number(process.env.DB_PORT) || 14535,
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // SSL obligatoire pour se connecter à Aiven depuis Render
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null
});
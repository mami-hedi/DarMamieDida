import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  // On utilise les variables d'environnement ou les valeurs locales par défaut
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "DarMamieDida",
  port: process.env.DB_PORT || 3306,
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // Crucial pour Aiven : configuration SSL
  ssl: {
    rejectUnauthorized: false // Permet la connexion sécurisée sans certificat CA local
  }
});
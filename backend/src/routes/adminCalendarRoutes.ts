import { Router } from "express";
import { db } from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// ─────────────────────────────────────────────
// 🏗️  Initialisation des tables au démarrage
// ─────────────────────────────────────────────
export async function initCalendarTables(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS price_periods (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      room_id    INT          NOT NULL,
      label      VARCHAR(100) NOT NULL,
      date_start DATE         NOT NULL,
      date_end   DATE         NOT NULL,
      price      DECIMAL(10,2) NOT NULL,
      color      VARCHAR(20)  DEFAULT '#6366f1',
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      room_id    INT          NOT NULL,
      date_start DATE         NOT NULL,
      date_end   DATE         NOT NULL,
      reason     VARCHAR(255),
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Tables calendar initialisées (price_periods, blocked_dates)");
}

// ═══════════════════════════════════════════════
//  TARIFS PAR PÉRIODE  (/api/admin/calendar/prices)
// ═══════════════════════════════════════════════

// 🔹 GET toutes les périodes tarifaires (optionnel ?room_id=X)
router.get("/prices", async (req, res) => {
  try {
    const { room_id } = req.query;

    let sql = "SELECT * FROM price_periods";
    const params: any[] = [];

    if (room_id) {
      sql += " WHERE room_id = ?";
      params.push(room_id);
    }

    sql += " ORDER BY date_start ASC";

    const [rows] = await db.query<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 GET les périodes tarifaires d'une chambre
router.get("/prices/:room_id", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM price_periods WHERE room_id = ? ORDER BY date_start ASC",
      [req.params.room_id]
    );
    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST - Créer une période tarifaire
router.post("/prices", async (req, res) => {
  const { room_id, label, date_start, date_end, price, color } = req.body;

  if (!room_id || !label || !date_start || !date_end || price === undefined) {
    return res.status(400).json({
      error: "Les champs room_id, label, date_start, date_end et price sont obligatoires",
    });
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO price_periods (room_id, label, date_start, date_end, price, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [room_id, label, date_start, date_end, price, color || "#6366f1"]
    );

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM price_periods WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT - Modifier une période tarifaire
router.put("/prices/:id", async (req, res) => {
  const { room_id, label, date_start, date_end, price, color } = req.body;

  if (!room_id || !label || !date_start || !date_end || price === undefined) {
    return res.status(400).json({
      error: "Les champs room_id, label, date_start, date_end et price sont obligatoires",
    });
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE price_periods
       SET room_id = ?, label = ?, date_start = ?, date_end = ?, price = ?, color = ?
       WHERE id = ?`,
      [room_id, label, date_start, date_end, price, color || "#6366f1", req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Période tarifaire non trouvée" });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM price_periods WHERE id = ?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE - Supprimer une période tarifaire
router.delete("/prices/:id", async (req, res) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM price_periods WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Période tarifaire non trouvée" });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════
//  BLOCAGE DE DATES  (/api/admin/calendar/blocked)
// ═══════════════════════════════════════════════

// 🔹 GET toutes les dates bloquées
router.get("/blocked", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM blocked_dates ORDER BY date_start ASC"
    );
    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 GET les dates bloquées d'une chambre
router.get("/blocked/:room_id", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM blocked_dates WHERE room_id = ? ORDER BY date_start ASC",
      [req.params.room_id]
    );
    res.json(rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST - Bloquer des dates
router.post("/blocked", async (req, res) => {
  const { room_id, date_start, date_end, reason } = req.body;

  if (!room_id || !date_start || !date_end) {
    return res.status(400).json({
      error: "Les champs room_id, date_start et date_end sont obligatoires",
    });
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO blocked_dates (room_id, date_start, date_end, reason)
       VALUES (?, ?, ?, ?)`,
      [room_id, date_start, date_end, reason || null]
    );

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM blocked_dates WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE - Débloquer des dates
router.delete("/blocked/:id", async (req, res) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM blocked_dates WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Blocage non trouvé" });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

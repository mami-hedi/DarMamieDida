import express from "express";
import db from "../db.js"; // <-- adapte selon ton projet

const router = express.Router();

// 📌 Liste des réservations
router.get("/reservations", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, rooms.name AS room_name
      FROM reservations r
      JOIN rooms ON rooms.id = r.room_id
      ORDER BY r.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Modifier le statut
router.put("/reservations/:id/status", async (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Statut invalide" });
  }

  try {
    await db.query(`UPDATE reservations SET status = ? WHERE id = ?`, [
      status,
      id,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

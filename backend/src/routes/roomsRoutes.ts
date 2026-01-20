// routes/roomsRoutes.ts
import { Router } from "express";
import { db } from "../db";

const router = Router();

// 🔹 1️⃣ Chambres disponibles selon dates (PRIORITAIRE)
router.get("/available", async (req, res) => {
  const { checkin, checkout } = req.query;

  if (!checkin || !checkout) {
    return res.status(400).json({ error: "Dates requises" });
  }

  try {
    const checkinDate = new Date(checkin as string).toISOString().split("T")[0];
    const checkoutDate = new Date(checkout as string).toISOString().split("T")[0];

    const sql = `
      SELECT *
FROM rooms
WHERE is_active = 1
  AND id NOT IN (
    SELECT room_id
    FROM reservations
    WHERE status IN ('confirmed', 'pending')
      AND NOT (
        DATE(checkout) <= ?
        OR DATE(checkin) >= ?
      )
  )
ORDER BY name ASC
    `;

    const [rooms] = await db.query(sql, [checkinDate, checkoutDate]);

    console.log("✅ DISPONIBILITÉ CHAMBRES");
    console.log("checkin :", checkinDate, "checkout:", checkoutDate);

    res.json(rooms);

  } catch (error: any) {
    console.error("🔥 ERREUR SQL :", error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 2️⃣ GET chambre par slug (PUBLIC)
router.get("/:slug", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM rooms WHERE slug = ? AND is_active = 1 LIMIT 1",
      [req.params.slug]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Chambre introuvable" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 3️⃣ GET toutes les chambres (ADMIN TARIFS, tri par nom)
router.get("/", async (req, res) => {
  try {
    const [rooms] = await db.query(
      "SELECT id, name, slug, price, size, capacity, image, description FROM rooms WHERE is_active = 1 ORDER BY name ASC"
    );
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 4️⃣ Modifier le tarif d'une chambre (ADMIN)
router.put("/:id/price", async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  if (price === undefined || price < 0) {
    return res.status(400).json({ error: "Prix invalide" });
  }

  try {
    await db.query("UPDATE rooms SET price = ? WHERE id = ?", [price, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

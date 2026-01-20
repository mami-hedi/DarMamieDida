import { Router } from "express";
import { db } from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { upload } from "../middlewares/upload";

const router = Router();

// 🔹 GET toutes les chambres
router.get("/", async (req, res) => {
  try {
    const [rooms] = await db.query<RowDataPacket[]>(
      "SELECT id, name, description, slug, price, size, capacity, image, is_active, created_at FROM rooms ORDER BY id ASC"
    );
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 GET une chambre par ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM rooms WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Chambre non trouvée" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 POST - Créer une chambre (UPLOAD IMAGE)
router.post("/", upload.single("image"), async (req, res) => {
  const { name, description, slug, price, size, capacity, is_active } = req.body;

  if (!name || !slug || !price) {
    return res.status(400).json({ error: "Nom, slug et prix sont obligatoires" });
  }

  const image = req.file ? `/uploads/rooms/${req.file.filename}` : "";

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO rooms (name, description, slug, price, size, capacity, image, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || "",
        slug,
        price,
        size || 0,
        capacity || 1,
        image,
        is_active ?? 1, // 👈 actif par défaut
      ]
    );

    const [room] = await db.query<RowDataPacket[]>(
      "SELECT * FROM rooms WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(room[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ce slug existe déjà" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT - Modifier une chambre (IMAGE OPTIONNELLE)
router.put("/:id", upload.single("image"), async (req, res) => {
  const { name, description, slug, price, size, capacity, is_active } = req.body;

  if (!name || !slug || !price) {
    return res.status(400).json({ error: "Nom, slug et prix sont obligatoires" });
  }

  const image = req.file ? `/uploads/rooms/${req.file.filename}` : null;

  try {
    let sql = `
      UPDATE rooms
      SET name = ?, description = ?, slug = ?, price = ?, size = ?, capacity = ?, is_active = ?
    `;
    const params: any[] = [
      name,
      description || "",
      slug,
      price,
      size || 0,
      capacity || 1,
      is_active,
    ];

    if (image) {
      sql += ", image = ?";
      params.push(image);
    }

    sql += " WHERE id = ?";
    params.push(req.params.id);

    const [result] = await db.query<ResultSetHeader>(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Chambre non trouvée" });
    }

    const [room] = await db.query<RowDataPacket[]>(
      "SELECT * FROM rooms WHERE id = ?",
      [req.params.id]
    );

    res.json(room[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ce slug existe déjà" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE - Supprimer une chambre
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      "UPDATE rooms SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Chambre non trouvée" });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

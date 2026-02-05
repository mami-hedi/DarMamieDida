import { Router } from "express";
import { Request } from 'express';
// Si l'erreur persiste sur .file, tu peux "tricher" temporairement en castant l'objet :
// const file = (req as any).file;
import { db } from "../db";
import { upload } from "../middlewares/upload";

const router = Router();

// 🔹 GET galerie d'une chambre
router.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM room_gallery WHERE room_id = ? ORDER BY `order` ASC",
      [roomId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 POST – Ajouter des images
router.post("/:roomId", upload.array("images", 10), async (req, res) => {
  const { roomId } = req.params;
  if (!req.files || (req.files as any).length === 0) {
    return res.status(400).json({ error: "Aucune image uploadée" });
  }

  try {
    const files = req.files as Express.Multer.File[];
    const values = files.map(f => [roomId, `/uploads/rooms/${f.filename}`, 0]);
    await db.query(
      "INSERT INTO room_gallery (room_id, url, `order`) VALUES ?",
      [values]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔹 DELETE – Supprimer une image
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM room_gallery WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;

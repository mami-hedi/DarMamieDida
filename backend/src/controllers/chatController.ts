import { Request, Response } from "express";
import { db } from "../db";

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const text = message?.toLowerCase() || "";

    if (!message) {
      return res.json({ reply: "Comment puis-je vous aider ?" });
    }

    /* =========================
       DISPONIBILITÉ
    ========================= */
    const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      const date = dateMatch[0];

      const [rows]: any = await db.query(
        `
        SELECT r.name
        FROM rooms r
        WHERE r.id NOT IN (
          SELECT room_id
          FROM reservations
          WHERE ? >= checkin AND ? < checkout
        )
        `,
        [date, date]
      );

      if (rows.length === 0) {
        return res.json({
          reply: `Aucune chambre disponible le ${date}.`,
        });
      }

      return res.json({
        reply: `Chambres disponibles le ${date} : ${rows
          .map((r: any) => r.name)
          .join(", ")}`,
      });
    }

    /* =========================
       TARIFS
    ========================= */
    if (text.includes("prix") || text.includes("tarif") || text.includes("combien")) {
      const [rows]: any = await db.query(
        "SELECT name, price FROM rooms"
      );

      const prices = rows
        .map((r: any) => `${r.name} : ${r.price} DT / nuit`)
        .join("\n");

      return res.json({
        reply: `Voici nos tarifs :\n${prices}`,
      });
    }

    /* =========================
       CAPACITÉ
    ========================= */
    if (text.includes("capacité") || text.includes("personne")) {
      const [rows]: any = await db.query(
        "SELECT name, capacity FROM rooms"
      );

      const capacities = rows
        .map((r: any) => `${r.name} : ${r.capacity} personnes`)
        .join("\n");

      return res.json({
        reply: `Capacité des chambres :\n${capacities}`,
      });
    }

    /* =========================
       LISTE DES CHAMBRES
    ========================= */
    if (text.includes("chambre")) {
      const [rows]: any = await db.query(
        "SELECT name FROM rooms"
      );

      return res.json({
        reply: `Nos chambres disponibles : ${rows
          .map((r: any) => r.name)
          .join(", ")}`,
      });
    }

    /* =========================
       AIDE PAR DÉFAUT
    ========================= */
    return res.json({
      reply:
        "Je peux vous aider pour : disponibilités, tarifs, capacité ou liste des chambres.",
    });
  } catch (error) {
    console.error("Erreur ChatBot :", error);
    return res.status(500).json({
      reply: "Erreur serveur.",
    });
  }
};

import express from "express";
import {
  fetchReservations,
  addReservation,
  modifyStatus,
} from "../controllers/reservation.controller";
import { db } from "../db";

const router = express.Router();

/**
 * Récupérer toutes les réservations (côté client)
 */
router.get("/", fetchReservations);

/**
 * 🔥 Récupérer les jours réservés POUR TOUTES LES CHAMBRES (utilisation backend/admin)
 */
router.get("/days", async (req, res) => {
  try {
    const [rows]: any = await db.query(
      "SELECT checkin, checkout FROM reservations WHERE status != 'cancelled'"
    );

    const reservedDays: string[] = [];

    rows.forEach((reservation: any) => {
      const start = new Date(reservation.checkin);
      const end = new Date(reservation.checkout);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        reservedDays.push(localDate.toISOString().split("T")[0]);
      }
    });

    res.json({ reservedDays });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur /days" });
  }
});

/**
 * ✅ Récupérer les jours réservés d’une SEULE chambre
 *    (pour afficher son calendrier correctement)
 */
router.get("/days/:room_id", async (req, res) => {
  const room_id = req.params.room_id;

  try {
    const [rows]: any = await db.query(
      "SELECT checkin, checkout FROM reservations WHERE room_id = ? AND status != 'cancelled'",
      [room_id]
    );

    const reservedDays: string[] = [];

    rows.forEach((reservation: any) => {
      const start = new Date(reservation.checkin);
      const end = new Date(reservation.checkout);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        reservedDays.push(localDate.toISOString().split("T")[0]);
      }
    });

    res.json({ reservedDays });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur /days/:room_id" });
  }
});

/**
 * Ajouter une nouvelle réservation
 */
router.post("/", addReservation);

/**
 * Modifier le statut d'une réservation (admin)
 */
router.put("/:id/status", modifyStatus);

export default router;

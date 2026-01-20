import { Request, Response } from "express";
import { sendReservationEmail } from "../services/sendEmail";
import { getReservations, createReservation, updateStatus } from "../services/reservation.service";
import { io } from "../index";

// ⚠️ DEV uniquement : ignorer les certificats auto-signés (ne jamais utiliser en prod)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * Récupérer toutes les réservations
 */
export const fetchReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await getReservations();
    res.json(reservations);
  } catch (err: any) {
    console.error("❌ Erreur fetchReservations:", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

/**
 * Ajouter une nouvelle réservation (utilisateur)
 */
export const addReservation = async (req: Request, res: Response) => {
  try {
    // Créer la réservation
    const id = await createReservation(req.body);


    // 🔔 Notification admin via Socket.io
    io.emit("admin-notification", {
      type: "reservation_created",
      title: "Nouvelle réservation",
      message: `Nouvelle réservation pour Chambre ${req.body.room_id} par ${req.body.name}`,
      reservation_id: id,
      created_at: new Date(),
    });

    // ⚡ Envoyer un email de confirmation au client
    sendReservationEmail(req.body);

    res.json({ message: "Réservation enregistrée", id });
  } catch (err: any) {
    console.error("❌ Erreur addReservation:", err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Modifier le statut d'une réservation (utilisateur ou admin)
 */
export const modifyStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    // Validation simple du statut
    if (!["confirmed", "cancelled", "pending"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    await updateStatus(id, status);

    // 🔔 Notification admin pour changement de statut
    io.emit("admin-notification", {
      type: "reservation_status_changed",
      title: status === "cancelled" ? "Réservation annulée" : "Statut modifié",
      message: `La réservation ID ${id} est maintenant "${status}"`,
      reservation_id: id,
      created_at: new Date(),
    });

    res.json({ message: "Statut mis à jour" });
  } catch (err: any) {
    console.error("❌ Erreur modifyStatus:", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

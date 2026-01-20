import { Request, Response } from "express";
import {
  getAdminReservations,
  updateStatus,
  addReservation,
  editReservation,
  removeReservation
} from "../services/adminReservation.service";
import { io } from "../index";

// Récupérer toutes les réservations
export const fetchAdminReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await getAdminReservations();
    res.json(reservations);
  } catch (err: any) {
    console.error("❌ Erreur fetchAdminReservations:", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// Ajouter une réservation (ADMIN)
export const createAdminReservation = async (req: Request, res: Response) => {
  try {
    const newRes = await addReservation(req.body);

    // 🔔 Notification admin
    io.emit("admin-notification", {
      type: "reservation_created",
      title: "Nouvelle réservation",
      message: `Nouvelle réservation pour Chambre ${newRes.room_id} – ${newRes.name}`,
      created_at: new Date(),
    });

    res.json({ message: "Réservation ajoutée", reservation: newRes });
  } catch (err: any) {
    console.error("❌ Erreur createAdminReservation:", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout", details: err.message });
  }
};

// Modifier une réservation (ADMIN)
export const updateAdminReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Récupération des données modifiées (req.body)
    const updatedData = req.body;
    await editReservation(id, updatedData);

    // 🔹 Emission Socket avec id réservation + id chambre
    io.emit("admin-notification", {
      type: "reservation_updated",
      title: "Réservation modifiée",
      message: `La réservation ID ${id} a été modifiée. Chambre  ${updatedData.room_id}`,
      created_at: new Date(),
    });

    res.json({ message: "Réservation mise à jour" });
  } catch (err: any) {
    console.error("❌ Erreur updateAdminReservation:", err.message);
    res.status(500).json({ 
      error: "Erreur lors de la modification", 
      details: err.message 
    });
  }
};


// Modifier statut
export const modifyAdminStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await updateStatus(Number(id), status);

    io.emit("admin-notification", {
      type: "reservation_status_changed",
      title: status === "cancelled" ? "Réservation annulée" : "Statut modifié",
      message: `La réservation ID ${id} est maintenant "${status}"`,
      created_at: new Date(),
    });

    res.json({ message: "Statut mis à jour" });
  } catch (err: any) {
    console.error("❌ Erreur modifyAdminStatus:", err.message);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
};

// Supprimer une réservation (ADMIN)
export const deleteAdminReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await removeReservation(id);

    io.emit("admin-notification", {
      type: "reservation_deleted",
      title: "Réservation supprimée",
      message: `La réservation ID ${id} a été supprimée`,
      created_at: new Date(),
    });

    res.json({ message: "Réservation supprimée" });
  } catch (err: any) {
    console.error("❌ Erreur deleteAdminReservation:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression", details: err.message });
  }
};

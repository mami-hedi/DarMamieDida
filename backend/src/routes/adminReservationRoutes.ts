import express from "express";
import {
  fetchAdminReservations,
  modifyAdminStatus,
  createAdminReservation,
  updateAdminReservation,
  deleteAdminReservation
} from "../controllers/adminReservation.controller";

const router = express.Router();

// GET — Récupérer toutes les réservations
router.get("/", fetchAdminReservations);

// POST — Ajouter une réservation
router.post("/", createAdminReservation);

// PUT — Modifier une réservation
router.put("/:id", updateAdminReservation);

// PUT — Modifier uniquement le statut
router.put("/:id/status", modifyAdminStatus);

// DELETE — Supprimer une réservation
router.delete("/:id", deleteAdminReservation);

export default router;

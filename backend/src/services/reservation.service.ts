import { db } from "../db";
import { Reservation } from "../types";

// Récupérer toutes les réservations
export const getReservations = async () => {
  const [rows] = await db.query("SELECT * FROM reservations ORDER BY checkin ASC");
  return rows;
};

// Créer une réservation
export const createReservation = async (reservation: Reservation) => {
  const { room_id, name, email, phone, checkin, checkout, message } = reservation;

  // Vérifier que la date de départ est après la date d'arrivée
  if (new Date(checkout) <= new Date(checkin)) {
    throw new Error("La date de départ doit être après la date d'arrivée.");
  }

  // Vérifier si la chambre existe
  const [roomExists]: any = await db.query(
    "SELECT id FROM rooms WHERE id = ?",
    [room_id]
  );
  if (roomExists.length === 0) {
    throw new Error("Cette chambre n'existe pas.");
  }

  // ✅ MODIFICATION PRINCIPALE : Vérifier un conflit de date EN EXCLUANT les réservations annulées
  const [exists]: any = await db.query(
    `SELECT * FROM reservations 
     WHERE room_id = ? 
       AND status != 'cancelled'
       AND ((checkin <= ? AND checkout >= ?) 
        OR  (checkin <= ? AND checkout >= ?)
        OR  (checkin >= ? AND checkout <= ?))`,
    [room_id, checkin, checkin, checkout, checkout, checkin, checkout]
  );

  if (exists.length > 0) {
    throw new Error("La chambre est déjà réservée pour ces dates.");
  }

  // Insérer la réservation
  const [result]: any = await db.query(
    `INSERT INTO reservations 
     (room_id, name, email, phone, checkin, checkout, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, "pending")`,
    [room_id, name, email, phone || null, checkin, checkout, message || null]
  );

  return result.insertId;
};

// Mettre à jour le statut
export const updateStatus = async (id: number, status: string) => {
  await db.query("UPDATE reservations SET status = ? WHERE id = ?", [status, id]);
};
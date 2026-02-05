import { db } from "../db";
import { Reservation } from "../types";


// 🔹 Récupérer TOUTES les réservations (Correction du JOIN pour ne perdre aucune ligne)
export const getAdminReservations = async () => {
  const [rows]: any = await db.query(`
    SELECT r.*, rm.name AS room_name, rm.price
    FROM reservations r
    LEFT JOIN rooms rm ON r.room_id = rm.id
    ORDER BY r.checkin ASC
  `); 
  // Le LEFT JOIN est la clé pour revoir tes 378 lignes !
  
  return rows.map((r: any) => ({
    ...r,
    nights: r.nights || 0,
    total: r.total || 0,
    room_name: r.room_name || "Chambre Inconnue"
  }));
};

// 🔹 Ajouter réservation ADMIN (CORRIGÉ : Ajout de nights et total)
export const addReservation = async (data: any) => {
  const sql = `
    INSERT INTO reservations
    (room_id, name, email, phone, checkin, checkout, message, status, payment_status, advance_amount, nights, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.room_id,
    data.name,
    data.email,
    data.phone,
    data.checkin,
    data.checkout,
    data.message || null,
    data.status || "confirmed",
    data.payment_status || "unpaid",
    data.advance_amount || 0,
    data.nights || 0, // ✅ Ajouté
    data.total || 0,   // ✅ Ajouté
  ];
  const [result]: any = await db.query(sql, values);
  return { id: result.insertId, ...data };
};

// 🔹 Modifier réservation ADMIN (CORRIGÉ : Ajout de nights et total)
export const editReservation = async (id: number, data: any) => {
  const sql = `
    UPDATE reservations SET
    room_id = ?, name = ?, email = ?, phone = ?, checkin = ?, checkout = ?, 
    message = ?, status = ?, payment_status = ?, advance_amount = ?, nights = ?, total = ?
    WHERE id = ?
  `;
  await db.query(sql, [
    data.room_id,
    data.name,
    data.email,
    data.phone,
    data.checkin,
    data.checkout,
    data.message || null,
    data.status,
    data.payment_status || "unpaid",
    data.advance_amount || 0,
    data.nights || 0, // ✅ Ajouté
    data.total || 0,  // ✅ Ajouté
    id
  ]);
};

// 🔹 Modifier uniquement le statut
export const updateStatus = async (id: number, status: string) => {
  await db.query("UPDATE reservations SET status = ? WHERE id = ?", [status, id]);
};

// 🔹 Supprimer réservation
export const removeReservation = async (id: number) => {
  await db.query("DELETE FROM reservations WHERE id = ?", [id]);
};

// 🔹 Vérifier les chambres disponibles pour un intervalle
export const getAvailableRooms = async (checkin: string, checkout: string) => {
  const sql = `
    SELECT *
    FROM rooms
    WHERE id NOT IN (
      SELECT room_id
      FROM reservations
      WHERE status != 'cancelled'
        AND NOT (checkout <= ? OR checkin >= ?)
    )
  `;
  const [rooms] = await db.query(sql, [checkin, checkout]);
  return rooms;
};
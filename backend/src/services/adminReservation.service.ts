import { db } from "../db";
import { Reservation } from "../types";

// 🔹 Récupérer toutes les réservations pour admin
// 🔹 Récupérer toutes les réservations pour admin avec total et nights
export const getAdminReservations = async () => {
  const [rows]: any = await db.query(`
    SELECT r.*, rm.name AS room_name, rm.price
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    ORDER BY r.checkin ASC
  `);

  // Calculer nights et total
  return rows.map((r: any) => {
    const checkinDate = new Date(r.checkin);
    const checkoutDate = new Date(r.checkout);
    const nights = Math.max(
      0,
      Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const total = nights * Number(r.price || 0);

    return {
      ...r,
      nights,
      total,
    };
  });
};


// 🔹 Ajouter réservation ADMIN
export const addReservation = async (data: any) => {
  const sql = `
    INSERT INTO reservations
    (room_id, name, email, phone, checkin, checkout, message, status, payment_status, advance_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  ];
  const [result]: any = await db.query(sql, values);
  return { id: result.insertId, ...data };
};

// 🔹 Modifier réservation ADMIN
export const editReservation = async (id: number, data: any) => {
  const sql = `
    UPDATE reservations SET
    room_id = ?, name = ?, email = ?, phone = ?, checkin = ?, checkout = ?, 
    message = ?, status = ?, payment_status = ?, advance_amount = ?
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
    id
  ]);
};

// 🔹 Modifier uniquement le statut
// ❌ ERREUR ICI : Mauvaise syntaxe tagged template
// ✅ CORRECTION :
export const updateStatus = async (id: number, status: string) => {
  await db.query("UPDATE reservations SET status = ? WHERE id = ?", [status, id]);
};

// 🔹 Supprimer réservation
// ❌ ERREUR ICI : Mauvaise syntaxe tagged template
// ✅ CORRECTION :
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
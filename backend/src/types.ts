export interface Reservation {
  id?: number;
  room_id: number;
  name: string;
  email: string;
  phone?: string;
  checkin: string;  // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  message?: string;
  status?: "pending" | "confirmed" | "cancelled";
}

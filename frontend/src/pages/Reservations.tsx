import React from "react";
import Calendar from "../components/Calendar";

export default function Reservations() {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Calendrier des réservations</h1>
      <Calendar />
    </div>
  );
}

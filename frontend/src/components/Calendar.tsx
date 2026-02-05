import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


// ✅ Déclaration de l'URL dynamique
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

interface Day {
  date: string;
  available: boolean;
}

const fetchDays = async (): Promise<Day[]> => {
  // ✅ URL dynamique avec backticks
  const res = await fetch(`${BACKEND_URL}/api/reservations/days?year=2025&month=2`);
  if (!res.ok) throw new Error("Erreur lors du chargement des jours");
  return res.json();
};

const reserveDay = async (date: string) => {
  // ✅ URL dynamique pour le POST
  const res = await fetch(`${BACKEND_URL}/api/reservations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur réservation");
  }
  return res.json();
};

export default function Calendar() {
  const queryClient = useQueryClient();

  const { data: days, isLoading, isError } = useQuery(["days"], fetchDays);
  const mutation = useMutation(reserveDay, {
    onSuccess: () => queryClient.invalidateQueries(["days"]),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement des jours</div>;

  return (
    <div className="grid grid-cols-7 gap-2">
      {days!.map((d) => {
        const isReserved = !d.available || mutation.isLoading;
        return (
          <div
            key={d.date}
            onClick={() => !isReserved && mutation.mutate(d.date)}
            className={`p-3 text-center rounded cursor-pointer transition-colors duration-200
              ${d.available ? "bg-green-500 hover:bg-green-600" : "bg-red-500 cursor-not-allowed"}
              ${mutation.isLoading && "opacity-70"}`}
            title={d.available ? "Cliquer pour réserver" : "Non disponible"}
          >
            {new Date(d.date).getDate()}
          </div>
        );
      })}
    </div>
  );
}

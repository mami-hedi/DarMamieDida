import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Day {
  date: string;
  available: boolean;
}

const fetchDays = async (): Promise<Day[]> => {
  const res = await fetch("http://localhost:3000/api/reservations/days?year=2025&month=2");
  return res.json();
};

const reserveDay = async (date: string) => {
  const res = await fetch("http://localhost:3000/api/reservations/", {
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

  const { data: days, isLoading } = useQuery(["days"], fetchDays);
  const mutation = useMutation(reserveDay, {
    onSuccess: () => queryClient.invalidateQueries(["days"]),
  });

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="grid grid-cols-7 gap-2">
      {days!.map((d) => (
        <div
          key={d.date}
          onClick={() => d.available && mutation.mutate(d.date)}
          className={`p-3 text-center rounded cursor-pointer ${
            d.available ? "bg-green-500 hover:bg-green-600" : "bg-red-500 cursor-not-allowed"
          }`}
        >
          {d.date.split("-")[2]}
        </div>
      ))}
    </div>
  );
}

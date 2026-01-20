export interface Day {
  date: string;
  available: boolean;
}

const API_URL = "http://localhost:3000/api/reservations";

export async function getDays(year?: number, month?: number): Promise<Day[]> {
  const url = new URL(`${API_URL}/days`);
  if (year) url.searchParams.append("year", String(year));
  if (month) url.searchParams.append("month", String(month));

  const res = await fetch(url.toString());
  return res.json();
}

export async function reserveDay(date: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur réservation");
  }

  return res.json();
}

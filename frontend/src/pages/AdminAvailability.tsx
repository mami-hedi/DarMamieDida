import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";

interface Room {
  id: number;
  name: string;
  price: number;
  image?: string;
}

export function AdminAvailability() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");

  // Date du jour (format YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const searchRooms = async (checkin: string, checkout: string) => {
    setLoading(true);
    setError(null);
    setRooms([]);

    // Sécurité front
    if (!checkin || !checkout) {
      setError("Veuillez sélectionner les deux dates.");
      setLoading(false);
      return;
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const todayDate = new Date(today);

    if (checkinDate < todayDate || checkoutDate < todayDate) {
      setError("Vous ne pouvez pas sélectionner une date passée.");
      setLoading(false);
      return;
    }

    if (checkoutDate <= checkinDate) {
      setError("La date de départ doit être après la date d'arrivée.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/rooms/available?checkin=${checkin}&checkout=${checkout}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur serveur");
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Format des données invalide.");
      }

      setRooms(data);
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchRooms(checkin, checkout);
  };

  const navigate = useNavigate();
const goToRoom = (room: Room) => {
  navigate("/admin/reservations", {
    state: {
      openModal: true,
      room_id: room.id,
      checkin,
      checkout,
    },
  });
};



  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Admin */}
      <Sidebar active="disponibilite" />

      {/* Contenu principal */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-20 md:pt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Vérifier la disponibilité
        </h1>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white rounded shadow space-y-4 max-w-md mx-auto"
        >
          <div>
            <label className="block text-sm mb-1">Date d'arrivée</label>
            <Input
              type="date"
              min={today}
              value={checkin}
              onChange={(e) => {
                const value = e.target.value;
                setCheckin(value);

                // Reset checkout si invalide
                if (checkout && checkout <= value) {
                  setCheckout("");
                }
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Date de départ</label>
            <Input
              type="date"
              min={checkin || today}
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              disabled={!checkin}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Rechercher
          </Button>
        </form>

        {/* États */}
        {loading && (
          <p className="text-center mt-4 font-medium">Chargement...</p>
        )}

        {error && (
          <p className="text-center text-red-600 font-medium mt-4">
            {error}
          </p>
        )}

        {/* Résultats */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-center">
          Chambres disponibles
        </h2>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {rooms.length === 0 && !loading && !error && (
            <p className="text-gray-600 text-center col-span-2">
              Aucune chambre disponible pour cette période
            </p>
          )}

          {rooms.map((room) => (
            <div
              key={room.id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              <h3 className="font-bold text-lg">{room.name}</h3>
              <p className="text-gray-600">
                {room.price} TND / nuit
              </p>
              <Button className="mt-3" onClick={() => goToRoom(room)}>
  Réserver
</Button>

            </div>

          ))}
        </div>
      </main>
    </div>
  );
}

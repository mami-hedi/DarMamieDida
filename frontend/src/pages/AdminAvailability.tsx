import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ArrowRight,
  BedDouble,
  Search,
  AlertCircle,
  CalendarOff,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Room {
  id: number;
  name: string;
  price: number;
  image?: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

// Résout le chemin d'image (URL absolue OU chemin relatif renvoyé par l'API)
// et bascule sur un repli propre si l'image est manquante ou ne charge pas.
function RoomImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  const resolvedSrc = (() => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
    return `${BACKEND_URL}${src.startsWith("/") ? "" : "/"}${src}`;
  })();

  if (!resolvedSrc || failed) {
    return <BedDouble className="h-10 w-10 text-indigo-300" />;
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );
}

export function AdminAvailability() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  // Nombre de nuits + prix total
  const nights =
    checkin && checkout ? Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000) : 0;

  const searchRooms = async (checkin: string, checkout: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

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
        `${BACKEND_URL}/api/rooms/available?checkin=${checkin}&checkout=${checkout}`
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
      setRooms([]);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchRooms(checkin, checkout);
  };

  const goToRoom = (room: Room) => {
    navigate("/admin/reservations", {
      state: { openModal: true, room_id: room.id, checkin, checkout },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active="disponibilite" />

      <main className="flex-1 p-4 md:p-8 overflow-auto pt-20 md:pt-8">
        {/* En-tête */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gray-500 shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Recherche de disponibilité
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Vérifier la disponibilité
          </h1>
          <p className="mt-2 text-gray-500">
            Sélectionnez une période pour voir les chambres disponibles.
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-5 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d'arrivée
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  min={today}
                  value={checkin}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCheckin(value);
                    if (checkout && checkout <= value) setCheckout("");
                  }}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center pb-2.5">
              <ArrowRight className="h-4 w-4 text-gray-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de départ
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  min={checkin || today}
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  disabled={!checkin}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="md:min-w-[140px]">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
          </div>

          {/* Résumé de la période */}
          {nights > 0 && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              {nights} {nights > 1 ? "nuits" : "nuit"} · du{" "}
              <span className="font-medium text-gray-700">
                {new Date(checkin).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>{" "}
              au{" "}
              <span className="font-medium text-gray-700">
                {new Date(checkout).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </p>
          )}
        </form>

        {/* Erreur */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Résultats */}
        {(hasSearched || rooms.length > 0) && (
          <div className="max-w-4xl mx-auto mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Chambres disponibles
              </h2>
              {!loading && rooms.length > 0 && (
                <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
                  {rooms.length} {rooms.length > 1 ? "résultats" : "résultat"}
                </span>
              )}
            </div>

            {/* Skeletons pendant le chargement */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
                    <div className="h-32 rounded-lg bg-gray-200 mb-4" />
                    <div className="h-5 w-2/3 rounded bg-gray-200 mb-2" />
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 && !error ? (
              /* État vide */
              <div className="rounded-2xl border border-dashed bg-white py-16 text-center">
                <CalendarOff className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700">
                  Aucune chambre disponible pour cette période
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Essayez de modifier vos dates de séjour.
                </p>
              </div>
            ) : (
              /* Cartes chambres */
              <div className="grid md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="group rounded-xl border bg-white overflow-hidden shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                  >
                    {/* Visuel */}
                    <div className="h-36 bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                      <RoomImage src={room.image} alt={room.name} />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                          {room.name}
                        </h3>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900">
                            {room.price} TND
                          </p>
                          <p className="text-xs text-gray-400">/ nuit</p>
                        </div>
                      </div>

                      {nights > 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          Total :{" "}
                          <span className="font-medium text-gray-700">
                            {(room.price * nights).toLocaleString("fr-FR")} TND
                          </span>{" "}
                          pour {nights} {nights > 1 ? "nuits" : "nuit"}
                        </p>
                      )}

                      <Button className="mt-4 w-full" onClick={() => goToRoom(room)}>
                        Réserver
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
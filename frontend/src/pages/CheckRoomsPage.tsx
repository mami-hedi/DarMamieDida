import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckAvailability } from "@/components/CheckAvailability";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";

interface Room {
  id: number;
  name: string;
  slug: string; // Slug avec majuscule : Chambre1, Chambre2...
  price: number;
  image?: string;
}

export default function CheckRoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

  const [selectedCheckin, setSelectedCheckin] = useState("");
  const [selectedCheckout, setSelectedCheckout] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const isPastDate = (dateStr: string) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < todayDate;
  };

  const searchRooms = async (checkin: string, checkout: string) => {
    setLoading(true);
    setError(null);
    setRooms([]);

    setSelectedCheckin(checkin);
    setSelectedCheckout(checkout);

    if (isPastDate(checkin) || isPastDate(checkout)) {
      setError(t("checkRooms.alert.pastDate"));
      setLoading(false);
      return;
    }

    if (checkout <= checkin) {
      setError(t("checkRooms.alert.checkoutAfterCheckin"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/rooms/available?checkin=${checkin}&checkout=${checkout}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t("checkRooms.alert.serverError"));
      }

      const data: Room[] = await res.json();

      if (!Array.isArray(data)) {
        throw new Error(t("checkRooms.alert.invalidData"));
      }

      setRooms(data);
    } catch (err: any) {
      setError(err.message || t("checkRooms.alert.serverError"));
    }

    setLoading(false);
  };

  // 🚀 Redirection vers la chambre sélectionnée avec slug exact (majuscule conservée)
  const goToRoom = (room: Room) => {
    navigate(
      `/chambres/${room.name}?checkin=${selectedCheckin}&checkout=${selectedCheckout}`
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t("checkRooms.title")}
        </h1>

        <CheckAvailability onSearch={searchRooms} />

        {loading && <p className="text-center mt-4">{t("checkRooms.loading")}</p>}

        {error && (
          <p className="text-center text-red-600 font-medium mt-4">{error}</p>
        )}

        <h2 className="text-xl font-bold mt-6 mb-4 text-center">
          {t("checkRooms.availableRooms")}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {rooms.length === 0 && !loading && !error && (
            <p className="text-gray-600 text-center col-span-2">
              {t("checkRooms.noRooms")}
            </p>
          )}

          {rooms.map((room) => (
            <div key={room.id} className="border rounded p-4 shadow-sm">
              <h3 className="font-bold text-lg">{room.name}</h3>
              <p className="text-gray-600">
                {room.price} {t("checkRooms.currency")} / {t("checkRooms.night")}
              </p>

              <Button className="mt-3" onClick={() => goToRoom(room)}>
                {t("checkRooms.reserve")}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

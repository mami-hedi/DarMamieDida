import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckAvailability } from "@/components/CheckAvailability";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";
import { DoorOpen, AlertCircle, ArrowRight, BedDouble } from "lucide-react";

interface Room {
  id: number;
  name: string;
  slug: string; // Slug avec majuscule : Chambre1, Chambre2...
  price: number;
  image?: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

// Résout le chemin d'image renvoyé par l'API (URL absolue OU chemin relatif style "/uploads/xxx.jpg")
// et affiche un repli propre (icône) si l'image est manquante ou ne charge pas.
function RoomImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  const resolvedSrc = (() => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
    return `${BACKEND_URL}${src.startsWith("/") ? "" : "/"}${src}`;
  })();

  if (!resolvedSrc || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#B8A88E]">
        <BedDouble className="w-8 h-8" />
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
    />
  );
}

export default function CheckRoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedCheckin, setSelectedCheckin] = useState("");
  const [selectedCheckout, setSelectedCheckout] = useState("");

  const isPastDate = (dateStr: string) => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < todayDate;
  };

  const nightsCount = (() => {
    if (!selectedCheckin || !selectedCheckout) return 0;
    const diff =
      new Date(selectedCheckout).getTime() - new Date(selectedCheckin).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  })();

  const searchRooms = async (checkin: string, checkout: string) => {
    setLoading(true);
    setError(null);
    setRooms([]);
    setHasSearched(true);

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

  // Redirection vers la chambre sélectionnée avec slug exact (majuscule conservée)
  const goToRoom = (room: Room) => {
    navigate(
      `/chambres/${room.name}?checkin=${selectedCheckin}&checkout=${selectedCheckout}`
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F1]">
        {/* Bandeau d'intro */}
        <div className="border-b border-[#E7E0D4] bg-[#FAF7F1]">
          <div className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1C5D7C]/10 text-[#1C5D7C] mb-5">
              <DoorOpen className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#2A2521] leading-tight">
              {t("checkRooms.title")}
            </h1>
            <p className="mt-3 text-[#6B5F52] max-w-md mx-auto">
              {t("checkRooms.subtitle", "Choisissez vos dates, on vous montre les chambres libres à Dar Mamie Dida.")}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-6 pb-20">
          {/* Carte de recherche */}
          <div className="bg-white rounded-2xl border border-[#E7E0D4] shadow-[0_1px_3px_rgba(42,37,33,0.06)] p-5 md:p-6">
            <CheckAvailability onSearch={searchRooms} />
          </div>

          {/* États : chargement / erreur */}
          {loading && (
            <div className="mt-10">
              <div className="grid md:grid-cols-2 gap-5">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#E7E0D4] overflow-hidden animate-pulse"
                  >
                    <div className="h-36 bg-[#EFE9DD]" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 bg-[#EFE9DD] rounded" />
                      <div className="h-3 w-1/3 bg-[#EFE9DD] rounded" />
                      <div className="h-9 w-28 bg-[#EFE9DD] rounded-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#E7B9A3] bg-[#FBF0EA] px-4 py-3.5 text-[#8C3B1B]">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Résultats */}
          {!loading && hasSearched && !error && (
            <div className="mt-10">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-serif text-xl text-[#2A2521]">
                  {t("checkRooms.availableRooms")}
                </h2>
                {rooms.length > 0 && nightsCount > 0 && (
                  <span className="text-sm text-[#8A7C6C]">
                    {nightsCount} {nightsCount > 1 ? t("checkRooms.nights", "nuits") : t("checkRooms.night")}
                  </span>
                )}
              </div>

              {rooms.length === 0 ? (
                <div className="text-center rounded-2xl border border-dashed border-[#D9CFBE] py-14 px-6">
                  <BedDouble className="w-7 h-7 mx-auto text-[#B8A88E] mb-3" />
                  <p className="text-[#6B5F52]">{t("checkRooms.noRooms")}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="group rounded-2xl border border-[#E7E0D4] bg-white overflow-hidden hover:border-[#1C5D7C]/40 hover:shadow-[0_6px_20px_rgba(28,93,124,0.08)] transition-all duration-200"
                    >
                      <div className="h-40 bg-[#EFE9DD] overflow-hidden">
                        <RoomImage src={room.image} alt={room.name} />
                      </div>

                      <div className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-lg text-[#2A2521]">
                            {room.name}
                          </h3>
                          <p className="text-sm text-[#8A7C6C] mt-0.5">
                            <span className="text-[#C1622D] font-medium">
                              {room.price} {t("checkRooms.currency")}
                            </span>{" "}
                            / {t("checkRooms.night")}
                          </p>
                        </div>

                        <Button
                          onClick={() => goToRoom(room)}
                          className="rounded-full bg-[#1C5D7C] hover:bg-[#164A63] text-white shrink-0"
                        >
                          {t("checkRooms.reserve")}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
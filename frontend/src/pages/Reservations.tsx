import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, ChevronRight, CalendarDays,
  ArrowRight, BedDouble, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── types ─────────────────────────────────────────────────────────────── */
interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

interface BlockedPeriod {
  date_start: string;
  date_end: string;
  reason?: string;
}

/* ─── constantes ─────────────────────────────────────────────────────────── */
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

const DAYS_HEADER = ["L", "Ma", "Me", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const toISO = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const todayISO = () => {
  const n = new Date();
  return toISO(n.getFullYear(), n.getMonth(), n.getDate());
};

const isoToDate = (iso: string) => new Date(`${iso}T00:00:00`);

const isInPeriods = (dateStr: string, periods: BlockedPeriod[]) =>
  periods.some((p) => dateStr >= p.date_start && dateStr <= p.date_end);

function RoomImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = !src ? null :
    /^https?:\/\//i.test(src) ? src :
    `${BACKEND_URL}${src.startsWith("/") ? "" : "/"}${src}`;
  if (!resolved || failed) {
    return <div className="w-full h-full flex items-center justify-center text-[#B8A88E]"><BedDouble className="w-8 h-8" /></div>;
  }
  return (
    <img src={resolved} alt={alt} onError={() => setFailed(true)} loading="lazy"
      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function Reservations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = todayISO();

  /* calendrier */
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  /* sélection */
  const [checkin,  setCheckin]  = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [hovering, setHovering] = useState<string | null>(null);

  /* données API */
  const [blockedAll, setBlockedAll] = useState<BlockedPeriod[]>([]);
  const [rooms,      setRooms]      = useState<Room[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /* Charger tous les blocages admin (toutes chambres confondues) */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/calendar/blocked`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setBlockedAll(data))
      .catch(() => {}); // silencieux si table pas encore créée
  }, []);

  /* ── navigation mois ── */
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  /* ── calcul jours du mois ── */
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay(); // 0=dim
  const offset      = firstDow === 0 ? 6 : firstDow - 1; // lundi=0

  /* ── logique de sélection ── */
  const selectDay = (dateStr: string) => {
    if (dateStr < today) return; // passé
    if (isInPeriods(dateStr, blockedAll)) return; // bloqué

    if (!checkin || (checkin && checkout)) {
      // Premier clic ou reset
      setCheckin(dateStr);
      setCheckout(null);
    } else {
      // Deuxième clic
      if (dateStr <= checkin) {
        setCheckin(dateStr);
        setCheckout(null);
      } else {
        // Vérifie qu'il n'y a pas de jour bloqué dans la plage
        const hasBlockedInRange = blockedAll.some((p) => {
          return p.date_start < dateStr && p.date_end >= checkin;
        });
        if (hasBlockedInRange) return; // ne pas autoriser si blocage dans la plage
        setCheckout(dateStr);
        fetchRooms(checkin, dateStr);
      }
    }
  };

  const getDayState = (dateStr: string): "past" | "blocked" | "checkin" | "checkout" | "inrange" | "hover" | "today" | "available" => {
    if (dateStr < today)                        return "past";
    if (isInPeriods(dateStr, blockedAll))       return "blocked";
    if (dateStr === checkin)                     return "checkin";
    if (dateStr === checkout)                    return "checkout";
    if (checkin && checkout && dateStr > checkin && dateStr < checkout) return "inrange";
    if (checkin && !checkout && hovering && dateStr > checkin && dateStr <= hovering) return "hover";
    if (dateStr === today)                       return "today";
    return "available";
  };

  const dayClass: Record<string, string> = {
    past:      "text-[#C9C0B4] cursor-not-allowed",
    blocked:   "bg-red-100 text-red-400 cursor-not-allowed line-through",
    checkin:   "bg-[#1C5D7C] text-white rounded-l-full font-bold",
    checkout:  "bg-[#1C5D7C] text-white rounded-r-full font-bold",
    inrange:   "bg-[#1C5D7C]/15 text-[#2A2521]",
    hover:     "bg-[#1C5D7C]/10 text-[#2A2521]",
    today:     "ring-2 ring-[#1C5D7C] text-[#1C5D7C] font-semibold rounded-full",
    available: "hover:bg-[#EFE9DD] rounded-full cursor-pointer text-[#2A2521]",
  };

  /* ── fetch chambres disponibles ── */
  const fetchRooms = async (ci: string, co: string) => {
    setLoading(true);
    setApiError(null);
    setRooms([]);
    setHasSearched(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/available?checkin=${ci}&checkout=${co}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data: Room[] = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nights = checkin && checkout
    ? Math.round((isoToDate(checkout).getTime() - isoToDate(checkin).getTime()) / 86_400_000)
    : 0;

  const goToRoom = (room: Room) => {
    navigate(`/chambres/${encodeURIComponent(room.name)}?checkin=${checkin}&checkout=${checkout}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F1]">

        {/* Titre */}
        <div className="border-b border-[#E7E0D4] bg-[#FAF7F1]">
          <div className="max-w-5xl mx-auto px-6 pt-14 pb-10 text-center">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1C5D7C]/10 text-[#1C5D7C] mb-5">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#2A2521]">
              {t("reservations.title", "Choisissez vos dates")}
            </h1>
            <p className="mt-3 text-[#6B5F52] max-w-md mx-auto text-sm">
              {t("reservations.subtitle", "Cliquez sur votre date d'arrivée puis de départ. Les jours en rouge sont indisponibles.")}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 pb-20 mt-6 grid md:grid-cols-[1fr_340px] gap-8">

          {/* ── Calendrier ── */}
          <div>
            <div className="bg-white rounded-2xl border border-[#E7E0D4] shadow-sm p-5">

              {/* Nav mois */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="p-2 hover:bg-[#EFE9DD] rounded-full transition-colors">
                  <ChevronLeft className="w-4 h-4 text-[#6B5F52]" />
                </button>
                <span className="font-serif text-lg text-[#2A2521]">
                  {MONTHS[month]} {year}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-[#EFE9DD] rounded-full transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#6B5F52]" />
                </button>
              </div>

              {/* En-têtes jours */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_HEADER.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-[#8A7C6C] py-1">{d}</div>
                ))}
              </div>

              {/* Cellules */}
              <div className="grid grid-cols-7 gap-y-1">
                {/* Offset */}
                {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateStr = toISO(year, month, day);
                  const state   = getDayState(dateStr);
                  return (
                    <div
                      key={dateStr}
                      onClick={() => selectDay(dateStr)}
                      onMouseEnter={() => checkin && !checkout && setHovering(dateStr)}
                      onMouseLeave={() => setHovering(null)}
                      className={`flex items-center justify-center h-9 text-sm select-none transition-colors ${dayClass[state]}`}
                      title={
                        state === "blocked"
                          ? "Indisponible (bloqué par l'administrateur)"
                          : state === "past"
                          ? "Date passée"
                          : ""
                      }
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#8A7C6C]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1C5D7C] inline-block" />
                  Sélectionné
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1C5D7C]/15 inline-block" />
                  Période choisie
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-100 inline-block border border-red-200" />
                  Indisponible
                </span>
              </div>
            </div>

            {/* Sélection actuelle */}
            {(checkin || checkout) && (
              <div className="mt-4 bg-white rounded-xl border border-[#E7E0D4] p-4 flex flex-wrap items-center gap-4 text-sm text-[#2A2521]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#1C5D7C]" />
                  <span className="text-[#8A7C6C]">Arrivée :</span>
                  <strong>{checkin ?? "—"}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#1C5D7C]" />
                  <span className="text-[#8A7C6C]">Départ :</span>
                  <strong>{checkout ?? "—"}</strong>
                </div>
                {nights > 0 && (
                  <span className="text-[#C1622D] font-semibold">
                    {nights} {nights > 1 ? "nuits" : "nuit"}
                  </span>
                )}
                <button
                  onClick={() => { setCheckin(null); setCheckout(null); setRooms([]); setHasSearched(false); }}
                  className="ml-auto text-xs text-[#8A7C6C] hover:text-red-500 underline underline-offset-2"
                >
                  Réinitialiser
                </button>
              </div>
            )}
          </div>

          {/* ── Panneau résultats ── */}
          <div>
            {!hasSearched && (
              <div className="bg-white rounded-2xl border border-dashed border-[#D9CFBE] p-8 text-center text-[#8A7C6C]">
                <CalendarDays className="w-8 h-8 mx-auto mb-3 text-[#B8A88E]" />
                <p className="font-medium text-sm">
                  {t("reservations.hint", "Sélectionnez une date d'arrivée et une date de départ pour voir les chambres disponibles.")}
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-2xl border border-[#E7E0D4] overflow-hidden animate-pulse">
                    <div className="h-32 bg-[#EFE9DD]" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-1/2 bg-[#EFE9DD] rounded" />
                      <div className="h-3 w-1/3 bg-[#EFE9DD] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {apiError && !loading && (
              <div className="flex items-start gap-3 rounded-xl border border-[#E7B9A3] bg-[#FBF0EA] px-4 py-3.5 text-[#8C3B1B]">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">{apiError}</p>
              </div>
            )}

            {!loading && hasSearched && !apiError && (
              <div className="space-y-4">
                <h2 className="font-serif text-lg text-[#2A2521]">
                  {rooms.length > 0
                    ? t("checkRooms.availableRooms", "Chambres disponibles")
                    : t("checkRooms.noRooms", "Aucune chambre disponible")}
                </h2>

                {rooms.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D9CFBE] py-10 px-6 text-center">
                    <BedDouble className="w-6 h-6 mx-auto text-[#B8A88E] mb-2" />
                    <p className="text-sm text-[#6B5F52]">
                      {t("checkRooms.tryOtherDates", "Essayez d'autres dates ou contactez-nous.")}
                    </p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className="group rounded-2xl border border-[#E7E0D4] bg-white overflow-hidden hover:border-[#1C5D7C]/40 hover:shadow-md transition-all duration-200"
                    >
                      <div className="h-32 bg-[#EFE9DD] overflow-hidden">
                        <RoomImage src={room.image} alt={room.name} />
                      </div>
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-base text-[#2A2521]">{room.name}</h3>
                          <p className="text-sm text-[#8A7C6C] mt-0.5">
                            <span className="text-[#C1622D] font-semibold">{room.price} TND</span> / nuit
                            {nights > 0 && (
                              <span className="ml-1 text-[#1C5D7C]">= {room.price * nights} TND</span>
                            )}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => goToRoom(room)}
                          className="rounded-full bg-[#1C5D7C] hover:bg-[#164A63] text-white shrink-0"
                        >
                          {t("checkRooms.reserve", "Réserver")}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  DoorOpen, AlertCircle, ArrowRight, BedDouble,
  CalendarDays, Users, Search,
} from "lucide-react";

/* ─── types ──────────────────────────────────────────────────────────────── */
interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

/* ─── constantes ─────────────────────────────────────────────────────────── */
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const toISO = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try { e.currentTarget.showPicker?.(); } catch { /* non supporté */ }
};

/* ─── RoomImage ──────────────────────────────────────────────────────────── */
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

/* ─── Page principale ────────────────────────────────────────────────────── */
export default function CheckRoomsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const today    = toISO(new Date());
  const tomorrow = addDays(today, 1);

  /* ── State ── */
  const [checkin,  setCheckin]  = useState(() => searchParams.get("checkin")  || "");
  const [checkout, setCheckout] = useState(() => searchParams.get("checkout") || "");
  const [guests,   setGuests]   = useState(() => searchParams.get("guests")   || "2");
  const [formError, setFormError] = useState<string | null>(null);

  const [rooms,      setRooms]      = useState<Room[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const nights =
    checkin && checkout
      ? Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86_400_000)
      : 0;

  /* ── Lancer la recherche si les params URL sont déjà présents (depuis BookingBar) ── */
  useEffect(() => {
    const ci = searchParams.get("checkin");
    const co = searchParams.get("checkout");
    if (ci && co && co > ci) {
      fetchRooms(ci, co);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch ── */
  const fetchRooms = async (ci: string, co: string) => {
    setLoading(true);
    setApiError(null);
    setRooms([]);
    setHasSearched(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/rooms/available?checkin=${ci}&checkout=${co}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t("checkRooms.alert.serverError", "Erreur serveur"));
      }
      const data: Room[] = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit formulaire de recherche ── */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!checkin || !checkout) {
      setFormError(t("checkRooms.alert.selectBothDates", "Veuillez choisir vos dates d'arrivée et de départ."));
      return;
    }
    if (checkout <= checkin) {
      setFormError(t("checkRooms.alert.checkoutAfterCheckin", "Le départ doit être après l'arrivée."));
      return;
    }
    fetchRooms(checkin, checkout);
  };

  /* ── Checkin change ── */
  const onCheckinChange = (val: string) => {
    setCheckin(val);
    setFormError(null);
    if (!checkout || checkout <= val) setCheckout(addDays(val, 1));
  };

  /* ── Redirection vers la page chambre ── */
  const goToRoom = (room: Room) => {
    navigate(
      `/chambres/${encodeURIComponent(room.name)}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`
    );
  };

  /* ── Style helpers ── */
  const cell =
    "flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-colors hover:bg-[#F5F0E8] " +
    "border-b md:border-b-0 md:border-r border-[#E7E0D4] last:border-0";
  const fieldLabel = "block font-body text-[10px] font-semibold uppercase tracking-wider text-[#8A7C6C] mb-0.5";
  const fieldInput =
    "w-full bg-transparent font-body text-sm font-medium text-[#2A2521] outline-none cursor-pointer " +
    "[&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:cursor-pointer";

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F1]">

        {/* ── Bandeau d'intro ── */}
        <div className="border-b border-[#E7E0D4] bg-[#FAF7F1]">
          <div className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1C5D7C]/10 text-[#1C5D7C] mb-5">
              <DoorOpen className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#2A2521] leading-tight">
              {t("checkRooms.title", "Vérifier les disponibilités")}
            </h1>
            <p className="mt-3 text-[#6B5F52] max-w-md mx-auto text-sm">
              {t("checkRooms.subtitle", "Choisissez vos dates pour découvrir les chambres disponibles à Dar Mamie Dida.")}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-4 pb-20">

          {/* ── Formulaire de recherche ── */}
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl border border-[#E7E0D4] shadow-sm p-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.65fr_auto] items-stretch gap-1">

              {/* Arrivée */}
              <label className={cell}>
                <CalendarDays className="w-4 h-4 text-[#1C5D7C] shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className={fieldLabel}>
                    {t("availability.checkin", "Arrivée")}
                  </span>
                  <input
                    type="date"
                    className={fieldInput}
                    min={today}
                    value={checkin}
                    onClick={openPicker}
                    onChange={(e) => onCheckinChange(e.target.value)}
                  />
                </span>
              </label>

              {/* Départ */}
              <label className={cell}>
                <CalendarDays className="w-4 h-4 text-[#1C5D7C] shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className={fieldLabel}>
                    {t("availability.checkout", "Départ")}
                    {nights > 0 && (
                      <span className="text-[#C1622D] font-semibold ml-1">
                        · {nights} {nights > 1 ? t("checkRooms.nights", "nuits") : t("checkRooms.night", "nuit")}
                      </span>
                    )}
                  </span>
                  <input
                    type="date"
                    className={fieldInput}
                    min={checkin ? addDays(checkin, 1) : tomorrow}
                    value={checkout}
                    onClick={openPicker}
                    onChange={(e) => { setCheckout(e.target.value); setFormError(null); }}
                  />
                </span>
              </label>

              {/* Voyageurs */}
              <label className={cell}>
                <Users className="w-4 h-4 text-[#1C5D7C] shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className={fieldLabel}>{t("hero.booking.guests", "Voyageurs")}</span>
                  <select
                    className={fieldInput}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </span>
              </label>

              {/* Bouton */}
              <button
                type="submit"
                className="mt-1 md:mt-0 md:ml-1 flex items-center justify-center gap-2 rounded-xl bg-[#1C5D7C] hover:bg-[#164A63] text-white font-semibold px-6 py-3 transition-colors"
              >
                <Search className="w-4 h-4" />
                {t("availability.search", "Rechercher")}
              </button>
            </div>

            {/* Erreur formulaire */}
            {formError && (
              <p role="alert" className="px-4 pt-2 pb-1 text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formError}
              </p>
            )}
          </form>

          {/* ── Chargement ── */}
          {loading && (
            <div className="mt-8 grid md:grid-cols-2 gap-5">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-2xl border border-[#E7E0D4] overflow-hidden animate-pulse">
                  <div className="h-36 bg-[#EFE9DD]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-2/3 bg-[#EFE9DD] rounded" />
                    <div className="h-3 w-1/3 bg-[#EFE9DD] rounded" />
                    <div className="h-9 w-28 bg-[#EFE9DD] rounded-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Erreur API ── */}
          {apiError && !loading && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#E7B9A3] bg-[#FBF0EA] px-4 py-3.5 text-[#8C3B1B]">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{apiError}</p>
            </div>
          )}

          {/* ── Résultats ── */}
          {!loading && hasSearched && !apiError && (
            <div className="mt-8">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-serif text-xl text-[#2A2521]">
                  {t("checkRooms.availableRooms", "Chambres disponibles")}
                </h2>
                {rooms.length > 0 && nights > 0 && (
                  <span className="text-sm text-[#8A7C6C]">
                    {nights} {nights > 1 ? t("checkRooms.nights", "nuits") : t("checkRooms.night", "nuit")}
                  </span>
                )}
              </div>

              {rooms.length === 0 ? (
                <div className="text-center rounded-2xl border border-dashed border-[#D9CFBE] py-14 px-6">
                  <BedDouble className="w-7 h-7 mx-auto text-[#B8A88E] mb-3" />
                  <p className="text-[#6B5F52] font-medium mb-1">
                    {t("checkRooms.noRooms", "Aucune chambre disponible pour ces dates.")}
                  </p>
                  <p className="text-sm text-[#8A7C6C]">
                    {t("checkRooms.tryOtherDates", "Essayez d'autres dates ou contactez-nous directement.")}
                  </p>
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
                          <h3 className="font-serif text-lg text-[#2A2521]">{room.name}</h3>
                          <p className="text-sm text-[#8A7C6C] mt-0.5">
                            <span className="text-[#C1622D] font-semibold">
                              {room.price} {t("checkRooms.currency", "TND")}
                            </span>
                            {" "}/ {t("checkRooms.night", "nuit")}
                            {nights > 0 && (
                              <span className="ml-2 text-[#1C5D7C] font-medium">
                                = {room.price * nights} {t("checkRooms.currency", "TND")} total
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          onClick={() => goToRoom(room)}
                          className="rounded-full bg-[#1C5D7C] hover:bg-[#164A63] text-white shrink-0"
                        >
                          {t("checkRooms.reserve", "Réserver")}
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

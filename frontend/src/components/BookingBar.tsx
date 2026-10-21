import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users } from "lucide-react";

// Date locale au format YYYY-MM-DD (évite le décalage UTC)
const toISO = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* navigateur sans showPicker : le clic natif suffit */
  }
};

export function BookingBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = toISO(new Date());

  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState<string | null>(null);

  const nights =
    checkin && checkout
      ? Math.round(
          (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000
        )
      : 0;

  const onCheckinChange = (value: string) => {
    setCheckin(value);
    setError(null);
    if (!checkout || checkout <= value) setCheckout(addDays(value, 1));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout) {
      setError(t("hero.booking.errorMissing", "Choisissez vos dates d'arrivée et de départ."));
      return;
    }
    if (checkout <= checkin) {
      setError(t("hero.booking.errorOrder", "Le départ doit être après l'arrivée."));
      return;
    }
    navigate(`/disponibilite?checkin=${checkin}&checkout=${checkout}&guests=${guests}`);
  };

  const cell =
    "flex items-center gap-3 px-5 py-3 text-left rounded-xl cursor-pointer transition-colors hover:bg-secondary/70 " +
    "border-b md:border-b-0 md:border-r border-border last:border-0";
  const label = "block font-body text-xs text-muted-foreground mb-0.5";
  const field =
    "w-full bg-transparent font-body text-base font-medium text-foreground outline-none cursor-pointer " +
    "[&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer";

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-4xl mx-auto bg-background/95 backdrop-blur rounded-2xl shadow-2xl p-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.7fr_auto] items-stretch gap-1">
        <label className={cell}>
          <CalendarDays className="w-5 h-5 text-primary shrink-0" />
          <span className="flex-1">
            <span className={label}>{t("hero.booking.checkin", "Arrivée")}</span>
            <input
              type="date"
              className={field}
              min={today}
              value={checkin}
              onClick={openPicker}
              onChange={(e) => onCheckinChange(e.target.value)}
            />
          </span>
        </label>

        <label className={cell}>
          <CalendarDays className="w-5 h-5 text-primary shrink-0" />
          <span className="flex-1">
            <span className={label}>
              {t("hero.booking.checkout", "Départ")}
              {nights > 0 && (
                <span className="text-primary font-semibold">
                  {" "}· {nights}{" "}
                  {nights > 1 ? t("hero.booking.nights", "nuits") : t("hero.booking.night", "nuit")}
                </span>
              )}
            </span>
            <input
              type="date"
              className={field}
              min={checkin ? addDays(checkin, 1) : addDays(today, 1)}
              value={checkout}
              onClick={openPicker}
              onChange={(e) => {
                setCheckout(e.target.value);
                setError(null);
              }}
            />
          </span>
        </label>

        <label className={cell}>
          <Users className="w-5 h-5 text-primary shrink-0" />
          <span className="flex-1">
            <span className={label}>{t("hero.booking.guests", "Voyageurs")}</span>
            <select className={field} value={guests} onChange={(e) => setGuests(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </span>
        </label>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="rounded-xl h-auto py-4 px-10 mt-1 md:mt-0 md:ml-1"
        >
          {t("hero.booking.submit", "Vérifier")}
        </Button>
      </div>

      {error && (
        <p role="alert" className="px-5 pt-2 pb-1 text-sm text-destructive text-left">
          {error}
        </p>
      )}
    </form>
  );
}
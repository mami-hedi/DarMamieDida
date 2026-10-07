import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FaLock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Room {
  id: number;
  name: string;
}

interface PricePeriod {
  id: number;
  room_id: number;
  label: string;
  date_start: string;
  date_end: string;
  price: number;
  color: string;
}

interface BlockedDate {
  id: number;
  room_id: number;
  date_start: string;
  date_end: string;
  reason?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_HEADER = ["L", "Ma", "Me", "J", "V", "S", "D"];

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminCalendar() {
  const { toast } = useToast();

  // ── State : navigation ──
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based

  // ── State : rooms ──
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // ── State : data ──
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);

  // ── State : tabs ──
  const [activeTab, setActiveTab] = useState<"prices" | "blocked">("prices");

  // ── State : price dialog ──
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PricePeriod | null>(null);
  const [priceForm, setPriceForm] = useState({
    label: "",
    date_start: "",
    date_end: "",
    price: "",
    color: "#6366f1",
  });

  // ── State : block dialog ──
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date_start: "",
    date_end: "",
    reason: "",
  });

  // ─── Fetch rooms ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/rooms`)
      .then((r) => r.json())
      .then((data: Room[]) => {
        setRooms(data);
        if (data.length > 0) setSelectedRoomId(data[0].id);
      })
      .catch(() =>
        toast({ title: "Erreur", description: "Impossible de charger les chambres.", variant: "destructive" })
      );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fetch prices + blocked when room changes ─────────────────────────────

  useEffect(() => {
    if (!selectedRoomId) return;
    setLoading(true);

    Promise.all([
      fetch(`${BACKEND_URL}/api/admin/calendar/prices/${selectedRoomId}`).then(
        (r) => r.json()
      ),
      fetch(
        `${BACKEND_URL}/api/admin/calendar/blocked/${selectedRoomId}`
      ).then((r) => r.json()),
    ])
      .then(([prices, blocked]) => {
        setPricePeriods(prices);
        setBlockedDates(blocked);
      })
      .catch(() =>
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du calendrier.",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  // ─── Calendar logic ───────────────────────────────────────────────────────

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sunday
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday = 0

  function isBlocked(dateStr: string): boolean {
    return blockedDates.some(
      (b) => dateStr >= b.date_start && dateStr <= b.date_end
    );
  }

  function getPricePeriod(dateStr: string): PricePeriod | undefined {
    return pricePeriods.find(
      (p) => dateStr >= p.date_start && dateStr <= p.date_end
    );
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // ─── Price CRUD ───────────────────────────────────────────────────────────

  function openAddPrice() {
    setEditingPrice(null);
    setPriceForm({
      label: "",
      date_start: "",
      date_end: "",
      price: "",
      color: "#6366f1",
    });
    setShowPriceDialog(true);
  }

  function openEditPrice(p: PricePeriod) {
    setEditingPrice(p);
    setPriceForm({
      label: p.label,
      date_start: p.date_start,
      date_end: p.date_end,
      price: String(p.price),
      color: p.color,
    });
    setShowPriceDialog(true);
  }

  async function savePrice() {
    if (!selectedRoomId) return;
    const body = {
      room_id: selectedRoomId,
      label: priceForm.label,
      date_start: priceForm.date_start,
      date_end: priceForm.date_end,
      price: Number(priceForm.price),
      color: priceForm.color,
    };

    try {
      if (editingPrice) {
        const r = await fetch(
          `${BACKEND_URL}/api/admin/calendar/prices/${editingPrice.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!r.ok) throw new Error();
        toast({ title: "Tarif mis à jour ✅" });
      } else {
        const r = await fetch(`${BACKEND_URL}/api/admin/calendar/prices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error();
        toast({ title: "Tarif ajouté ✅" });
      }
      setShowPriceDialog(false);
      // Re-fetch
      const fresh = await fetch(
        `${BACKEND_URL}/api/admin/calendar/prices/${selectedRoomId}`
      ).then((r) => r.json());
      setPricePeriods(fresh);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le tarif.",
        variant: "destructive",
      });
    }
  }

  async function deletePrice(id: number) {
    if (!confirm("Supprimer cette période tarifaire ?")) return;
    try {
      const r = await fetch(
        `${BACKEND_URL}/api/admin/calendar/prices/${id}`,
        { method: "DELETE" }
      );
      if (!r.ok) throw new Error();
      setPricePeriods((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Tarif supprimé" });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tarif.",
        variant: "destructive",
      });
    }
  }

  // ─── Blocked dates CRUD ───────────────────────────────────────────────────

  function openAddBlock() {
    setBlockForm({ date_start: "", date_end: "", reason: "" });
    setShowBlockDialog(true);
  }

  async function saveBlock() {
    if (!selectedRoomId) return;
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/calendar/blocked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: selectedRoomId,
          date_start: blockForm.date_start,
          date_end: blockForm.date_end,
          reason: blockForm.reason || undefined,
        }),
      });
      if (!r.ok) throw new Error();
      toast({ title: "Dates bloquées ✅" });
      setShowBlockDialog(false);
      const fresh = await fetch(
        `${BACKEND_URL}/api/admin/calendar/blocked/${selectedRoomId}`
      ).then((r) => r.json());
      setBlockedDates(fresh);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de bloquer les dates.",
        variant: "destructive",
      });
    }
  }

  async function deleteBlock(id: number) {
    if (!confirm("Débloquer ces dates ?")) return;
    try {
      const r = await fetch(
        `${BACKEND_URL}/api/admin/calendar/blocked/${id}`,
        { method: "DELETE" }
      );
      if (!r.ok) throw new Error();
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Dates débloquées" });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de débloquer les dates.",
        variant: "destructive",
      });
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const today = todayStr();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar active="calendar" />

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 px-4 md:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Calendrier des disponibilités
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les tarifs saisonniers et les blocages de dates par chambre.
          </p>
        </div>

        {/* Room selector */}
        <div className="mb-6 flex items-center gap-3">
          <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Chambre :
          </Label>
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[200px]"
            value={selectedRoomId ?? ""}
            onChange={(e) => setSelectedRoomId(Number(e.target.value))}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* ── Calendar panel ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                aria-label="Mois précédent"
              >
                <FaChevronLeft />
              </button>
              <span className="text-base font-semibold text-slate-800">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                aria-label="Mois suivant"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_HEADER.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-slate-400 pb-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                Chargement…
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Empty offset cells */}
                {Array.from({ length: offset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateStr = toDateStr(year, month, day);
                    const blocked = isBlocked(dateStr);
                    const period = getPricePeriod(dateStr);
                    const isToday = dateStr === today;

                    // Build inline style for period background
                    const periodBg = period
                      ? `${period.color}33` // hex + 20% alpha
                      : undefined;
                    const periodBorder = period ? period.color : undefined;

                    return (
                      <div
                        key={day}
                        className={[
                          "relative flex flex-col items-center justify-start rounded-lg p-1 min-h-[2.5rem] md:min-h-[3rem] cursor-default select-none transition-all",
                          blocked
                            ? "bg-red-100 border border-red-300 text-red-700"
                            : period
                            ? "border-2"
                            : "border border-slate-100 hover:bg-slate-50",
                          isToday ? "ring-2 ring-indigo-500" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={{
                          backgroundColor: blocked ? undefined : periodBg,
                          borderColor: blocked ? undefined : periodBorder,
                        }}
                      >
                        {/* Day number */}
                        <span
                          className={`text-xs font-semibold leading-none mt-0.5 ${
                            blocked
                              ? "text-red-700"
                              : period
                              ? "text-slate-700"
                              : "text-slate-700"
                          }`}
                        >
                          {day}
                        </span>

                        {/* Icons / price */}
                        {blocked && (
                          <FaLock className="text-red-400 text-[8px] mt-0.5" />
                        )}
                        {!blocked && period && (
                          <span className="text-[9px] font-medium text-slate-600 leading-none mt-0.5 truncate w-full text-center">
                            {period.price}€
                          </span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-4 h-4 rounded bg-red-100 border border-red-300 inline-block" />
                Bloqué
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-4 h-4 rounded bg-indigo-100 border-2 border-indigo-400 inline-block" />
                Tarif spécial
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-4 h-4 rounded border-2 border-indigo-500 ring-2 ring-indigo-500 inline-block" />
                Aujourd'hui
              </div>
            </div>
          </div>

          {/* ── Tabs panel ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "prices"
                    ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("prices")}
              >
                💰 Tarifs saisonniers
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "blocked"
                    ? "text-red-600 border-b-2 border-red-500 bg-red-50/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("blocked")}
              >
                🔒 Dates bloquées
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* ── Prices tab ── */}
              {activeTab === "prices" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-1.5"
                      onClick={openAddPrice}
                    >
                      <FaPlus className="text-[10px]" />
                      Ajouter une période
                    </Button>
                  </div>

                  {pricePeriods.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      Aucun tarif saisonnier défini.
                    </p>
                  ) : (
                    pricePeriods.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
                      >
                        {/* Color dot */}
                        <span
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {p.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.date_start} → {p.date_end}
                          </p>
                          <p className="text-xs font-bold text-indigo-600 mt-0.5">
                            {p.price} €/nuit
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            onClick={() => openEditPrice(p)}
                            title="Modifier"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => deletePrice(p.id)}
                            title="Supprimer"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Blocked tab ── */}
              {activeTab === "blocked" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg gap-1.5"
                      onClick={openAddBlock}
                    >
                      <FaPlus className="text-[10px]" />
                      Bloquer des dates
                    </Button>
                  </div>

                  {blockedDates.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      Aucune date bloquée.
                    </p>
                  ) : (
                    blockedDates.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-start gap-3 bg-red-50 rounded-xl p-3 border border-red-100"
                      >
                        <FaLock className="text-red-400 mt-1 flex-shrink-0 text-xs" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600">
                            {b.date_start} → {b.date_end}
                          </p>
                          {b.reason && (
                            <p className="text-xs text-slate-400 italic mt-0.5 truncate">
                              {b.reason}
                            </p>
                          )}
                        </div>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
                          onClick={() => deleteBlock(b.id)}
                          title="Débloquer"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Price Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrice ? "Modifier le tarif" : "Ajouter un tarif saisonnier"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-slate-700">Libellé</Label>
              <Input
                className="mt-1"
                placeholder="Ex : Haute saison été"
                value={priceForm.label}
                onChange={(e) =>
                  setPriceForm((f) => ({ ...f, label: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-slate-700">Date début</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={priceForm.date_start}
                  onChange={(e) =>
                    setPriceForm((f) => ({ ...f, date_start: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-sm text-slate-700">Date fin</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={priceForm.date_end}
                  onChange={(e) =>
                    setPriceForm((f) => ({ ...f, date_end: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-slate-700">Prix / nuit (€)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder="150"
                  value={priceForm.price}
                  onChange={(e) =>
                    setPriceForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-sm text-slate-700">Couleur</Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    className="h-9 w-14 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    value={priceForm.color}
                    onChange={(e) =>
                      setPriceForm((f) => ({ ...f, color: e.target.value }))
                    }
                  />
                  <span className="text-xs text-slate-500 font-mono">
                    {priceForm.color}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowPriceDialog(false)}
              >
                Annuler
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                onClick={savePrice}
                disabled={
                  !priceForm.label ||
                  !priceForm.date_start ||
                  !priceForm.date_end ||
                  !priceForm.price
                }
              >
                {editingPrice ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Block Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bloquer des dates</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-slate-700">Date début</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={blockForm.date_start}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, date_start: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-sm text-slate-700">Date fin</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={blockForm.date_end}
                  onChange={(e) =>
                    setBlockForm((f) => ({ ...f, date_end: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label className="text-sm text-slate-700">
                Raison{" "}
                <span className="text-slate-400 font-normal">(optionnel)</span>
              </Label>
              <Input
                className="mt-1"
                placeholder="Ex : Travaux, fermeture annuelle…"
                value={blockForm.reason}
                onChange={(e) =>
                  setBlockForm((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowBlockDialog(false)}
              >
                Annuler
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                onClick={saveBlock}
                disabled={!blockForm.date_start || !blockForm.date_end}
              >
                Bloquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

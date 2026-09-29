import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { io } from "socket.io-client";
import { FaEdit, FaTrash, FaCalendarAlt, FaMoneyBillWave, FaUser, FaDownload, FaFilter, FaPlus } from "react-icons/fa";
import { Sidebar } from "@/components/Sidebar";
import { PhoneField } from "@/components/PhoneField";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

interface Reservation {
  id: number;
  room_id: number;
  room_name: string;
  name: string;
  email: string;
  phone: string;
  checkin: string;
  checkout: string;
  created_at: string;
  message?: string;
  status: "confirmed" | "cancelled" | "pending";
  payment_status: "paid" | "unpaid" | "partial";
  advance_amount: number;
  total: number;
  nights: number;
}

interface Room {
  id: number;
  name: string;
  price: number;
}

const statusConfig = {
  confirmed: { label: "Confirmé",   cls: "bg-green-100 text-green-700 border-green-200" },
  pending:   { label: "En attente", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Annulé",     cls: "bg-red-100 text-red-700 border-red-200" },
};

const paymentConfig: Record<string, string> = {
  paid: "Payé", partial: "Partiel", unpaid: "Non payé",
};

function PaymentBadge({ status, advance }: { status: string; advance: number }) {
  const cls =
    status === "paid"    ? "bg-green-100 text-green-700" :
    status === "partial" ? "bg-orange-100 text-orange-700" :
                           "bg-red-100 text-red-600";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {status === "partial" ? `Avance: ${advance} DT` : paymentConfig[status] ?? status}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function AdminReservations() {
  const { toast }   = useToast();
  const location    = useLocation();
  const navigate    = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms,        setRooms]        = useState<Room[]>([]);
  const [loading,      setLoading]      = useState(true);

  const [statusFilter,  setStatusFilter]  = useState("all");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [roomFilter,    setRoomFilter]    = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [filtersOpen,   setFiltersOpen]   = useState(false);

  const [formOpen,           setFormOpen]           = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const [formData, setFormData] = useState({
    room_id: 0, name: "", email: "", phone: "",
    checkin: "", checkout: "", message: "",
    status: "confirmed" as any,
    payment_status: "unpaid" as any,
    advance_amount: 0,
  });

  /* ── Fetch ─────────────────────────────── */
  const fetchReservations = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      const data = await res.json();
      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReservations(data);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const fetchRooms = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    const socket = io(BACKEND_URL);
    socket.on("reservationUpdated", fetchReservations);
    return () => { socket.disconnect(); };
  }, []);

  /* ── Form ──────────────────────────────── */
  const openForm = (r?: Reservation) => {
    if (r) {
      setEditingReservation(r);
      setFormData({
        room_id: r.room_id, name: r.name, email: r.email || "",
        phone: r.phone, checkin: r.checkin.split("T")[0],
        checkout: r.checkout.split("T")[0], message: r.message || "",
        status: r.status, payment_status: r.payment_status || "unpaid",
        advance_amount: r.advance_amount || 0,
      });
    } else {
      setEditingReservation(null);
      setFormData({ room_id: 0, name: "", email: "", phone: "", checkin: "", checkout: "",
        message: "", status: "confirmed", payment_status: "unpaid", advance_amount: 0 });
    }
    setFormOpen(true);
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find((r) => r.id === Number(formData.room_id));
    const nights = Math.ceil(
      (new Date(formData.checkout).getTime() - new Date(formData.checkin).getTime()) / 86400000
    );
    if (nights <= 0) { toast({ title: "Erreur", description: "Dates invalides", variant: "destructive" }); return; }
    const total   = nights * (selectedRoom?.price || 0);
    const payload = { ...formData, nights, total };
    try {
      const url = editingReservation
        ? `${BACKEND_URL}/api/admin/reservations/${editingReservation.id}`
        : `${BACKEND_URL}/api/admin/reservations`;
      const res = await fetch(url, {
        method: editingReservation ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      toast({ title: "Succès", description: "Enregistré avec succès" });
      setFormOpen(false);
      fetchReservations();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  /* ── Filtrage ──────────────────────────── */
  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus  = statusFilter  === "all" || r.status          === statusFilter;
      const matchesRoom    = roomFilter    === "all" || String(r.room_id)  === roomFilter;
      const matchesPayment = paymentFilter === "all" || r.payment_status   === paymentFilter;
      const matchesSearch  =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.room_name.toLowerCase().includes(searchQuery.toLowerCase());
      const from = dateFrom ? new Date(dateFrom) : null;
      const to   = dateTo   ? new Date(dateTo)   : null;
      const matchesDate = (!from || new Date(r.checkout) >= from) && (!to || new Date(r.checkin) <= to);
      return matchesStatus && matchesRoom && matchesPayment && matchesSearch && matchesDate;
    });
  }, [reservations, statusFilter, searchQuery, roomFilter, paymentFilter, dateFrom, dateTo]);

  const activeFiltersCount = [
    statusFilter !== "all", roomFilter !== "all", paymentFilter !== "all",
    !!dateFrom, !!dateTo, !!searchQuery,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setStatusFilter("all"); setRoomFilter("all"); setPaymentFilter("all");
    setDateFrom(""); setDateTo(""); setSearchQuery("");
  };

  /* ── Export CSV ────────────────────────── */
  const exportToCSV = () => {
    if (!filtered.length) { toast({ title: "Rien à exporter", variant: "destructive" }); return; }
    const headers = ["Nom","Email","Téléphone","Hébergement","Arrivée","Départ","Nuits","Total (DT)","Paiement","Avance","Statut","Créée le"];
    const esc = (v: any) => { const s = String(v ?? ""); return s.includes(";") || s.includes('"') ? `"${s.replace(/"/g,'""')}"` : s; };
    const rows = filtered.map((r) => [
      r.name, r.email || "", r.phone, r.room_name,
      new Date(r.checkin).toLocaleDateString(), new Date(r.checkout).toLocaleDateString(),
      r.nights, r.total, paymentConfig[r.payment_status] || r.payment_status,
      r.payment_status === "partial" ? r.advance_amount : "",
      statusConfig[r.status]?.label || r.status, new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv  = [headers, ...rows].map((row) => row.map(esc).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `reservations_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: `${filtered.length} réservation(s) exportée(s)` });
  };

  useEffect(() => {
    if (location.state?.openModal) {
      setFormData((f) => ({ ...f, room_id: location.state.room_id, checkin: location.state.checkin, checkout: location.state.checkout, status: "confirmed" }));
      setFormOpen(true);
    }
  }, [location.state]);

  /* ── RENDER ────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar active="reservations" />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Réservations</h1>
            <p className="text-gray-500 text-sm">Gérez vos réservations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} className="gap-2 text-sm">
              <FaDownload className="size-3" /> Export CSV
            </Button>
            <Button onClick={() => openForm()} className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-sm">
              <FaPlus className="size-3" /> Nouvelle
            </Button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total",       value: reservations.length,                                         icon: <FaCalendarAlt className="text-blue-500" />,   color: "" },
            { label: "Confirmées",  value: reservations.filter(r => r.status === "confirmed").length,   icon: <div className="w-2 h-2 rounded-full bg-green-500" />,  color: "text-green-600" },
            { label: "En attente",  value: reservations.filter(r => r.status === "pending").length,     icon: <div className="w-2 h-2 rounded-full bg-yellow-500" />, color: "text-yellow-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-medium">{s.label}</span>
                {s.icon}
              </div>
              <p className={`text-xl md:text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Barre de recherche + toggle filtres ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Input
              placeholder="Rechercher un client ou une chambre…"
              className="pl-9 bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaUser className="absolute left-3 top-3 text-gray-400 size-3.5" />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${filtersOpen ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            <FaFilter className="size-3" />
            Filtres {activeFiltersCount > 0 && <span className="bg-white text-indigo-600 rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center">{activeFiltersCount}</span>}
          </button>
        </div>

        {/* ── Panneau filtres (collapsible) ── */}
        {filtersOpen && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select className="border rounded-xl px-3 py-2 bg-gray-50 text-sm col-span-2 sm:col-span-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
            <select className="border rounded-xl px-3 py-2 bg-gray-50 text-sm col-span-2 sm:col-span-1" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
              <option value="all">Toutes chambres</option>
              {rooms.map((r) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
            </select>
            <select className="border rounded-xl px-3 py-2 bg-gray-50 text-sm" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="all">Tout paiement</option>
              <option value="paid">Payé</option>
              <option value="partial">Partiel</option>
              <option value="unpaid">Non payé</option>
            </select>
            <div className="flex flex-col gap-1">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs py-1.5 h-auto" placeholder="Du" />
              <Input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className="text-xs py-1.5 h-auto" placeholder="Au" />
            </div>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="col-span-2 sm:col-span-4 text-xs text-indigo-500 hover:text-indigo-700 font-medium underline text-left">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Badge résultats */}
        {activeFiltersCount > 0 && (
          <p className="text-xs text-gray-400 mb-3">
            <span className="font-semibold text-indigo-600">{filtered.length}</span> résultat{filtered.length > 1 ? "s" : ""}
          </p>
        )}

        {/* ── TABLEAU (desktop md+) ── */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b text-[11px] text-gray-400 uppercase font-semibold tracking-wide">
                  <th className="p-4">Client</th>
                  <th className="p-4">Hébergement</th>
                  <th className="p-4 text-center">Dates</th>
                  <th className="p-4 text-center">Paiement</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400 text-sm">Aucune réservation trouvée.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">{r.name}</div>
                      <div className="text-xs text-indigo-500">{r.email || "—"}</div>
                      <div className="text-xs text-gray-400">{r.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-700">{r.room_name}</div>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{r.nights} nuits</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-xs font-medium">{new Date(r.checkin).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">au</div>
                      <div className="text-xs font-medium">{new Date(r.checkout).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold text-gray-900 text-sm">{r.total} DT</div>
                      <PaymentBadge status={r.payment_status} advance={r.advance_amount} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openForm(r)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><FaEdit /></button>
                        <button
                          onClick={() => { if (confirm("Supprimer ?")) fetch(`${BACKEND_URL}/api/admin/reservations/${r.id}`, { method: "DELETE" }).then(fetchReservations); }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                        ><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CARTES (mobile / tablette <md) ── */}
        <div className="md:hidden space-y-3">
          {loading && <p className="text-center text-gray-400 py-8">Chargement…</p>}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">Aucune réservation trouvée.</div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              {/* Ligne 1 : nom + statut */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">{r.name}</p>
                  <p className="text-xs text-indigo-500">{r.email || "—"}</p>
                  <p className="text-xs text-gray-400">{r.phone}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {/* Ligne 2 : chambre + dates */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-700">{r.room_name}</p>
                  <p className="text-xs text-gray-400">{r.nights} nuit{r.nights > 1 ? "s" : ""}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>{new Date(r.checkin).toLocaleDateString()}</p>
                  <p className="text-gray-300">→</p>
                  <p>{new Date(r.checkout).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Ligne 3 : paiement + actions */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{r.total} DT</p>
                  <PaymentBadge status={r.payment_status} advance={r.advance_amount} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openForm(r)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                    <FaEdit size={13} />
                  </button>
                  <button
                    onClick={() => { if (confirm("Supprimer ?")) fetch(`${BACKEND_URL}/api/admin/reservations/${r.id}`, { method: "DELETE" }).then(fetchReservations); }}
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                  ><FaTrash size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MODAL ── */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="w-[95vw] max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingReservation ? "Détails Réservation" : "Nouvelle Saisie"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveReservation} className="space-y-4 mt-2">
              <div>
                <Label className="text-xs font-bold uppercase text-gray-400">Chambre</Label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: Number(e.target.value) })}
                  className="w-full border rounded-xl p-2.5 mt-1 bg-gray-50 border-gray-200 text-sm"
                >
                  <option value="">Sélectionner…</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.price} DT)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Nom</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 rounded-xl" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase text-gray-400">Téléphone</Label>
                <PhoneField value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Arrivée</Label>
                  <Input type="date" value={formData.checkin}  onChange={(e) => setFormData({ ...formData, checkin: e.target.value })}  className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Départ</Label>
                  <Input type="date" value={formData.checkout} onChange={(e) => setFormData({ ...formData, checkout: e.target.value })} className="mt-1 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Paiement</Label>
                  <select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })} className="w-full border rounded-xl p-2.5 mt-1 text-sm bg-gray-50 border-gray-200">
                    <option value="unpaid">Non payé</option>
                    <option value="partial">Avance</option>
                    <option value="paid">Payé</option>
                  </select>
                </div>
                {formData.payment_status === "partial" ? (
                  <div>
                    <Label className="text-xs font-bold uppercase text-orange-500">Montant Avance</Label>
                    <Input type="number" value={formData.advance_amount} onChange={(e) => setFormData({ ...formData, advance_amount: Number(e.target.value) })} className="mt-1 border-orange-200 bg-orange-50 rounded-xl" />
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-bold uppercase text-gray-400">Statut</Label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full border rounded-xl p-2.5 mt-1 text-sm bg-gray-50 border-gray-200">
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.payment_status === "partial" && (
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Statut Réservation</Label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full border rounded-xl p-2.5 mt-1 text-sm bg-gray-50 border-gray-200">
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              )}

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl mt-2">
                {editingReservation ? "Sauvegarder" : "Valider la réservation"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { io } from "socket.io-client";
import { FaEdit, FaTrash, FaCalendarAlt, FaMoneyBillWave, FaUser } from "react-icons/fa";
import { Sidebar } from "@/components/Sidebar";
import { AdminNotifications } from "@/components/AdminNotifications";
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

export function AdminReservations() {
  const { toast } = useToast();
  // À ajouter dans AdminReservations.tsx
const location = useLocation();
const navigate = useNavigate(); // Ajoute ceci si tu en as besoin
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const [formData, setFormData] = useState({
    room_id: 0,
    name: "",
    email: "",
    phone: "",
    checkin: "",
    checkout: "",
    message: "",
    status: "confirmed" as any,
    payment_status: "unpaid" as any,
    advance_amount: 0,
  });

  const statusConfig = {
  confirmed: { label: "Confirmé", class: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "En attente", class: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Annulé", class: "bg-red-100 text-red-700 border-red-200" },
};

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      const data = await res.json();
      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReservations(data);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchReservations();
    fetchRooms();
    const socket = io(BACKEND_URL);
    socket.on("reservationUpdated", fetchReservations);
    return () => { socket.disconnect(); };
  }, []);

  const openForm = (reservation?: Reservation) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData({
        room_id: reservation.room_id,
        name: reservation.name,
        email: reservation.email || "",
        phone: reservation.phone,
        checkin: reservation.checkin.split('T')[0],
        checkout: reservation.checkout.split('T')[0],
        message: reservation.message || "",
        status: reservation.status,
        payment_status: reservation.payment_status || "unpaid",
        advance_amount: reservation.advance_amount || 0,
      });
    } else {
      setEditingReservation(null);
      setFormData({
        room_id: 0, name: "", email: "", phone: "", checkin: "", checkout: "",
        message: "", status: "confirmed", payment_status: "unpaid", advance_amount: 0,
      });
    }
    setFormOpen(true);
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find(r => r.id === Number(formData.room_id));
    const start = new Date(formData.checkin);
    const end = new Date(formData.checkout);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      toast({ title: "Erreur", description: "Dates invalides", variant: "destructive" });
      return;
    }

    const total = nights * (selectedRoom?.price || 0);
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
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const filtered = reservations.filter(r => 
    (statusFilter === "all" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.room_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  

useEffect(() => {
  if (location.state?.openModal) {
    // On récupère les données envoyées par AdminAvailability
    setFormData({
      ...formData,
      room_id: location.state.room_id,
      checkin: location.state.checkin,
      checkout: location.state.checkout,
      status: "confirmed" // On peut pré-remplir le statut
    });
    setFormOpen(true); // On ouvre la modal automatiquement
  }
}, [location.state]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar active="reservations" />
      <main className="flex-1 p-4 md:p-8 pt-20">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de Bord</h1>
            <p className="text-gray-500">Gérez vos réservations </p>
          </div>
          <AdminNotifications />
        </div>

        {/* STATS RÉINTRODUITES ICI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">Total</span>
              <FaCalendarAlt className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{reservations.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">Confirmées</span>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {reservations.filter(r => r.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-medium">En attente</span>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">
              {reservations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          
        </div>

        {/* BARRE DE CONTRÔLE */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          <div className="relative w-full md:max-w-xs">
             <Input 
              placeholder="Rechercher un client..." 
              className="pl-10 bg-white border-gray-200" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaUser className="absolute left-3 top-3 text-gray-400 size-4" />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select className="border rounded-lg px-3 bg-white text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
            </select>
            <Button onClick={() => openForm()} className="bg-indigo-600 hover:bg-indigo-700 ml-auto">
              + Nouvelle Réservation
            </Button>
          </div>
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b text-xs text-gray-500 uppercase font-semibold">
                  <th className="p-4">Client & Email</th>
                  <th className="p-4">Hébergement</th>
                  <th className="p-4 text-center">Dates</th>
                  <th className="p-4 text-center">Paiement</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-xs text-indigo-500 font-medium">{r.email || "—"}</div>
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
                      <div className="font-bold text-gray-900">{r.total} DT</div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        r.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                        r.payment_status === 'partial' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {r.payment_status === 'partial' ? `Avance: ${r.advance_amount}DT` : r.payment_status}
                      </div>
                    </td>

                    <td className="p-4 text-center">
  {/* On récupère la config selon le statut de la réservation r.status */}
  <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${
    statusConfig[r.status as keyof typeof statusConfig]?.class || "bg-gray-100 text-gray-600"
  }`}>
    {statusConfig[r.status as keyof typeof statusConfig]?.label || r.status}
  </span>
</td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openForm(r)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><FaEdit /></button>
                        <button onClick={() => { if(confirm("Supprimer ?")) fetch(`${BACKEND_URL}/api/admin/reservations/${r.id}`, { method: "DELETE" }).then(() => fetchReservations()) }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL COMPLET AVEC EMAIL ET AVANCE */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {editingReservation ? 'Détails Réservation' : 'Nouvelle Saisie'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveReservation} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Chambre</Label>
                  <select value={formData.room_id} onChange={(e) => setFormData({...formData, room_id: Number(e.target.value)})} className="w-full border rounded-xl p-2.5 mt-1 bg-gray-50 focus:bg-white transition-all outline-none border-gray-200">
                    <option value="">Sélectionner une chambre...</option>
                    {rooms.map(room => <option key={room.id} value={room.id}>{room.name} ({room.price} DT)</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-gray-400">Nom Client</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase text-gray-400">Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold uppercase text-gray-400">Téléphone</Label>
                  <PhoneField value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-gray-400">Arrivée</Label>
                    <Input type="date" value={formData.checkin} onChange={(e) => setFormData({...formData, checkin: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold uppercase text-gray-400">Départ</Label>
                    <Input type="date" value={formData.checkout} onChange={(e) => setFormData({...formData, checkout: e.target.value})} className="mt-1 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold uppercase text-gray-400">Mode Paiement</Label>
                    <select value={formData.payment_status} onChange={(e) => setFormData({...formData, payment_status: e.target.value as any})} className="w-full border rounded-xl p-2.5 mt-1 text-sm bg-gray-50 border-gray-200">
                      <option value="unpaid">Non payé</option>
                      <option value="partial">Avance / Partiel</option>
                      <option value="paid">Payé</option>
                    </select>
                  </div>
                  
                  {formData.payment_status === "partial" ? (
                    <div className="animate-in zoom-in-95 duration-200">
                      <Label className="text-xs font-bold uppercase text-orange-500">Montant Avance</Label>
                      <Input type="number" value={formData.advance_amount} onChange={(e) => setFormData({...formData, advance_amount: Number(e.target.value)})} className="mt-1 border-orange-200 bg-orange-50 rounded-xl" />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-bold uppercase text-gray-400">Statut</Label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded-xl p-2.5 mt-1 text-sm bg-gray-50 border-gray-200">
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {/* Si on est en mode avance, on affiche le statut en dessous sur toute la largeur */}
                {formData.payment_status === "partial" && (
                   <div>
                      <Label className="text-xs font-bold uppercase text-gray-400">Statut Réservation</Label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border rounded-xl p-2.5 mt-1 text-sm bg-gray-50 border-gray-200 font-bold">
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                   </div>
                )}
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-100 mt-4">
                {editingReservation ? 'Sauvegarder les modifications' : 'Valider la réservation'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
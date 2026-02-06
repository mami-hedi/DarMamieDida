import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import {
  FaBed, FaCheckCircle, FaMoneyBillWave, FaClock,
  FaCalendarCheck, FaExclamationTriangle, FaSync
} from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

interface Reservation {
  id: number;
  name: string;
  room_id: number;
  checkin: string;
  checkout: string;
  status: string;
  total: number;
}

export function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    occupied: 0,
    available: 0,
    today: 0,
    upcoming: 0,
    canceled: 0,
    revenue: 0,
    confirmed: 0
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Fetch Chambres
      const roomsRes = await fetch(`${BACKEND_URL}/api/admin/rooms`);
      const roomsData = await roomsRes.json();
      setTotalRooms(roomsData.length);
      const occupiedCount = roomsData.filter((r: any) => r.status === "occupée" || r.status === "occupied").length;

      // 2. Fetch Réservations
      const resRes = await fetch(`${BACKEND_URL}/api/admin/reservations`);
      const data: Reservation[] = await resRes.json();
      setReservations(data);

      // Calcul des KPI
      const confirmedRes = data.filter(r => r.status === "confirmed");
      const revToday = confirmedRes
        .filter(r => r.checkin.startsWith(todayStr))
        .reduce((sum, r) => sum + Number(r.total || 0), 0);

      setKpis({
        occupied: occupiedCount,
        available: Math.max(0, roomsData.length - occupiedCount),
        today: data.filter(r => r.checkin.startsWith(todayStr)).length,
        upcoming: data.filter(r => r.checkin > todayStr && r.status !== 'cancelled').length,
        canceled: data.filter(r => r.status === "cancelled").length,
        revenue: revToday,
        confirmed: confirmedRes.length
      });

      // Revenus par mois (Stats sur 6 mois)
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthLabel = d.toLocaleString("fr-FR", { month: "short" });
        const monthNum = d.getMonth();
        const yearNum = d.getFullYear();

        const revenue = confirmedRes
          .filter(r => {
            const date = new Date(r.checkin);
            return date.getMonth() === monthNum && date.getFullYear() === yearNum;
          })
          .reduce((sum, r) => sum + Number(r.total || 0), 0);

        return { month: monthLabel, revenue };
      });
      setMonthlyRevenueData(monthlyData);

    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    if (!confirm(`Changer le statut en ${newStatus} ?`)) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/reservations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const COLORS = ['#f97316', '#10b981']; // Orange pour occupé, Vert pour libre

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar active="dashboard" />

      <main className="flex-1 p-4 md:p-8 pt-24 md:pt-10 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-slate-500 font-medium">Suivez l'activité de Dar Baya en temps réel.</p>
          </div>
          <button
            onClick={fetchData}
            className={`flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700 ${loading ? 'animate-pulse' : ''}`}
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Chambres Totales" value={totalRooms} icon={FaBed} color="text-blue-600" bg="bg-blue-50" />
          <StatCard title="Occupation" value={`${Math.round((kpis.occupied / totalRooms) * 100) || 0}%`} icon={FaClock} color="text-orange-600" bg="bg-orange-50" />
          <StatCard title="CA du Jour" value={`${kpis.revenue} DT`} icon={FaMoneyBillWave} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard title="Total Confirmé" value={kpis.confirmed} icon={FaCheckCircle} color="text-indigo-600" bg="bg-indigo-50" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Bar Chart - Revenus */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-500" /> Croissance des Revenus
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - État des chambres */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Disponibilité</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Occupées", value: kpis.occupied },
                      { name: "Libres", value: kpis.available }
                    ]}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {COLORS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{kpis.available}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Libres</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Occupées</span>
                <span className="font-bold">{kpis.occupied}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Libres</span>
                <span className="font-bold">{kpis.available}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Stats Grid */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Aujourd'hui</h3>
            <QuickInfoCard label="Arrivées" value={kpis.today} icon={FaCalendarCheck} color="text-blue-500" />
            <QuickInfoCard label="Annulations" value={kpis.canceled} icon={FaExclamationTriangle} color="text-red-500" />
            <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-100">
              <p className="text-xs font-bold opacity-80 uppercase">Total à venir</p>
              <p className="text-3xl font-black mt-1">{kpis.upcoming}</p>
              <p className="text-[10px] mt-2 leading-relaxed opacity-70 italic">Vérifiez les chambres pour les prochaines arrivées.</p>
            </div>
          </div>

          {/* Recent Reservations Table */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Dernières Activités</h2>
              <button className="text-xs font-bold text-indigo-600 hover:underline">Voir tout</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold text-center">Séjour</th>
                    <th className="px-6 py-4 font-bold text-center">Total</th>
                    <th className="px-6 py-4 font-bold text-center">Statut</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reservations.slice(0, 5).map(res => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-sm">{res.name}</p>
                        <p className="text-[10px] text-slate-400">ID: #{res.id}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-[11px] font-bold text-slate-600">
                          {new Date(res.checkin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          <span className="mx-1 text-slate-300">→</span>
                          {new Date(res.checkout).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-slate-700">{res.total} <small>DT</small></span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={res.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {res.status === 'pending' && (
                            <button onClick={() => handleStatusUpdate(res.id, 'confirmed')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"><FaCheckCircle size={14} /></button>
                          )}
                          <button onClick={() => handleStatusUpdate(res.id, 'cancelled')} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors"><FaExclamationTriangle size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Composants Stylisés Internes
function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md">
      <div className={`${bg} ${color} p-4 rounded-2xl`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function QuickInfoCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`${color} opacity-20 p-2 rounded-lg bg-current`}></div>
        <Icon className={`${color} -ml-8`} size={16} />
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { label: 'Attente', class: 'bg-orange-50 text-orange-600 border-orange-100' },
    confirmed: { label: 'Confirmée', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    cancelled: { label: 'Annulée', class: 'bg-slate-100 text-slate-400 border-slate-200' }
  };
  const config = configs[status] || configs.pending;
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${config.class}`}>
      {config.label}
    </span>
  );
}
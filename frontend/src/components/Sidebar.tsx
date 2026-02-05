// src/components/Sidebar.tsx
import { useState } from "react";
import { FaTachometerAlt, FaUser, FaCalendarAlt, FaSignOutAlt, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";



interface SidebarProps {
  active?: "reservations" | "clients" | "disponibilite" | "tarifs";
}

export function Sidebar({ active }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        <div className="p-6 text-2xl font-bold border-b flex justify-between items-center">
  <div className="leading-tight">
    <span className="text-blue-700">Espace Admin</span>
    <br />
    <span className="text-black">Dar Mamie </span>
    <span className="text-red-600">Dida</span>
  </div>

  <button
    className="md:hidden text-xl"
    onClick={() => setSidebarOpen(false)}
  >
    ✕
  </button>
</div>


        <nav className="flex-1 p-4 space-y-2">
          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 transition ${
              active === "reservations" ? "bg-blue-100 font-semibold" : ""
            }`}
            onClick={() => navigate("/admin/reservations")}
          >
            <FaTachometerAlt /> Réservations
          </button>

          <button
  className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 transition ${
    active === "rooms" ? "bg-blue-100 font-semibold" : ""
  }`}
  onClick={() => navigate("/admin/rooms")}
>
  <FaMoneyBillWave /> Gestion Chambres
</button>

          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 transition ${
              active === "clients" ? "bg-blue-100 font-semibold" : ""
            }`}
            onClick={() => navigate("/admin/clients")}
          >
            <FaUser /> Clients
          </button>

          <button
            className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 transition ${
              active === "disponibilite" ? "bg-blue-100 font-semibold" : ""
            }`}
            onClick={() => navigate("/admin/availability")}
          >
            <FaCalendarAlt /> Disponibilité
          </button>

          

        </nav>

        <button
  className="w-full flex items-center gap-3 px-4 py-2 rounded m-4 mt-auto text-red-600 hover:bg-red-100 transition"
  onClick={() => {
    localStorage.removeItem("admin_logged_in");
    navigate("/admin/login");
  }}
>
  <FaSignOutAlt /> Déconnexion
</button>

      </aside>

      {/* Header mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow">
        <button onClick={() => setSidebarOpen(true)} className="text-2xl">
          ☰
        </button>
        <span className="font-bold text-blue-700">Espace Admin <br/> Dar Mamie Dida</span>
      </div>
    </>
  );
}

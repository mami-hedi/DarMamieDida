import { useState } from "react";
import { FaTachometerAlt, FaUser, FaCalendarAlt, FaSignOutAlt, FaBed } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AdminNotifications } from "@/components/AdminNotifications";

type ActivePage = "reservations" | "clients" | "disponibilite" | "dashboard" | "rooms" | "calendar";

interface SidebarProps {
  active?: ActivePage;
}

export function Sidebar({ active }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems: { key: ActivePage; label: string; icon: React.ReactNode; path: string }[] = [
    { key: "dashboard",      label: "Dashboard",     icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { key: "reservations",   label: "Réservations",  icon: <FaCalendarAlt />,   path: "/admin/reservations" },
    { key: "rooms",          label: "Chambres",       icon: <FaBed />,           path: "/admin/rooms" },
    { key: "clients",        label: "Clients",        icon: <FaUser />,          path: "/admin/clients" },
    { key: "disponibilite",  label: "Disponibilité",  icon: <FaCalendarAlt />,   path: "/admin/availability" },
    { key: "calendar",       label: "Calendrier",     icon: <FaCalendarAlt />,   path: "/admin/calendar" },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR (desktop permanent / mobile sliding) ── */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-md flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {/* Header sidebar : Logo | spacer | Notif | ✕ mobile */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="leading-tight min-w-0">
            <span className="text-blue-700 font-black text-base block">Espace Admin</span>
            <span className="text-black font-semibold text-xs">Dar </span>
            <span className="text-red-600 font-black text-xs">Mamie Dida</span>
          </div>

          {/* Icône notifications tout à droite */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <AdminNotifications />
            {/* Bouton fermer — visible uniquement en mobile quand sidebar ouverte */}
            <button
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium text-left
                ${active === item.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
                }
              `}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="p-4 border-t border-slate-100">
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
            onClick={() => {
              localStorage.removeItem("admin_logged_in");
              navigate("/admin/login");
            }}
          >
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── HEADER MOBILE (barre fixe du haut) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center bg-white px-4 py-3 shadow-sm border-b border-slate-100">
        {/* Bouton hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-2xl text-slate-700 mr-3"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>

        {/* Titre centré */}
        <span className="font-black text-blue-700 text-sm flex-1">
          Dar <span className="text-red-600">Mamie Dida</span>
        </span>

        {/* Notifications tout à droite */}
        <AdminNotifications />
      </div>
    </>
  );
}

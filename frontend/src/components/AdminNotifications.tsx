import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { FaBell, FaCheck, FaTimes, FaExchangeAlt } from "react-icons/fa";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";
const STORAGE_KEY = "admin_notifications";

interface Notification {
  id: number;
  type: "reservation_created" | "reservation_status_changed" | string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

function getNotifStyle(type: string) {
  switch (type) {
    case "reservation_created":
      return {
        icon: <FaCheck className="text-emerald-500" size={12} />,
        dot: "bg-emerald-500",
        accent: "border-l-4 border-emerald-400",
        iconBg: "bg-emerald-50",
      };
    case "reservation_status_changed":
      return {
        icon: <FaExchangeAlt className="text-amber-500" size={12} />,
        dot: "bg-amber-500",
        accent: "border-l-4 border-amber-400",
        iconBg: "bg-amber-50",
      };
    default:
      return {
        icon: <FaBell className="text-slate-400" size={12} />,
        dot: "bg-slate-400",
        accent: "border-l-4 border-slate-300",
        iconBg: "bg-slate-50",
      };
  }
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Persistance localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Fermer en cliquant en dehors
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Connexion Socket.IO avec reconnexion auto
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("admin-notification", (data: Omit<Notification, "id" | "read">) => {
      const newNotif: Notification = { ...data, id: Date.now(), read: false };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);

      if (data.type === "reservation_created") {
        toast.success(data.title, { description: data.message, duration: 6000, icon: "🛎️" });
      } else if (data.type === "reservation_status_changed") {
        toast.warning(data.title, { description: data.message, duration: 5000, icon: "🔄" });
      } else {
        toast(data.title, { description: data.message });
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleOpen = () => {
    setOpen((prev) => {
      if (!prev) markAllRead();
      return !prev;
    });
  };

  return (
    <div className="relative flex-shrink-0" ref={wrapperRef}>
      {/* ── Bouton cloche ── */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
        title="Notifications"
      >
        <FaBell className="text-slate-600 text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-500 rounded-full animate-pulse leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panneau dropdown ──
          Responsive : sur mobile il s'ouvre vers la gauche (right-0) avec largeur max 90vw
          Sur desktop il s'ouvre normalement (w-96)
      */}
      {open && (
        <div
          className="
            absolute top-full mt-2
            right-0
            w-[min(384px,90vw)]
            max-h-[70vh]
            bg-white rounded-2xl border border-slate-100 shadow-2xl
            z-[999]
            flex flex-col overflow-hidden
          "
        >
          {/* Header panneau */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FaBell className="text-slate-500" size={13} />
              <span className="font-black text-slate-800 text-sm">Notifications</span>
              {notifications.length > 0 && (
                <span className="text-xs text-slate-400">({notifications.length})</span>
              )}
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-bold"
              title="Effacer tout"
            >
              <FaTimes size={9} /> Effacer
            </button>
          </div>

          {/* Liste notifications */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <FaBell size={26} className="mb-3 opacity-25" />
                <p className="text-sm font-medium">Aucune notification</p>
                <p className="text-xs mt-1 opacity-60 text-center px-4">
                  Les nouvelles réservations apparaîtront ici
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const style = getNotifStyle(n.type);
                return (
                  <div
                    key={n.id}
                    className={`
                      px-4 py-3 ${style.accent}
                      ${n.read ? "opacity-55" : ""}
                      hover:bg-slate-50 transition-colors
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icône type */}
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
                        {style.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Titre + point non-lu */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-800 text-sm truncate">{n.title}</p>
                          {!n.read && (
                            <span className={`flex-shrink-0 w-2 h-2 rounded-full ${style.dot}`} />
                          )}
                        </div>
                        {/* Message */}
                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        {/* Temps relatif */}
                        <p className="text-slate-400 text-[10px] mt-1 font-medium">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

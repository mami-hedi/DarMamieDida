import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { FaBell } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    // 🔔 Écoute l'événement unique admin-notification
    socket.on("admin-notification", (data: Notification) => {
      setNotifications(prev => [
        {
          ...data,
          id: Date.now(), // si l'ID serveur n'existe pas
          read: false,
        },
        ...prev
      ]);
    });

    return () => socket.disconnect();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Bouton de cloche */}
      <Button
        onClick={() => {
          setOpen(!open);
          markAllRead();
        }}
        variant="ghost"
        className="relative"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Liste des notifications */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded shadow-lg z-50">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">Aucune notification</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                  n.read ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="font-semibold">{n.title}</div>
                <div className="text-gray-600 text-sm">{n.message}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

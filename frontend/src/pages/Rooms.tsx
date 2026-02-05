import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/ReservationModal";
import { Users, Maximize } from "lucide-react";
import { useTranslation } from "react-i18next";

import heroImage from "@/assets/gallery/photo7.jpeg";

/* =======================
   Types
======================= */
interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  size: number;
  capacity: number;
  image?: string;
  description?: string;
}

// 1. On utilise la variable d'environnement ou l'URL de Render par défaut
const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

/* =======================
   Component
======================= */
const Rooms = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/rooms")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur chargement chambres");
        return res.json();
      })
      .then((data: Room[]) => setRooms(data))
      .catch((err) => {
        console.error("❌ Rooms fetch error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* =======================
         Hero Section
      ======================= */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative z-10 text-center container-custom">
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-background mb-4">
            {t("rooms.hero.title")}
          </h1>
          <p className="font-body text-lg text-background/90">
            {t("rooms.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* =======================
         Rooms Grid
      ======================= */}
      <section className="section-padding">
        <div className="container-custom">

          {loading && (
            <p className="text-center text-muted-foreground">
              Chargement des chambres...
            </p>
          )}

          {error && (
            <p className="text-center text-red-600">
              Impossible de charger les chambres
            </p>
          )}

          {!loading && !error && rooms.length === 0 && (
            <p className="text-center text-muted-foreground">
              Aucune chambre disponible
            </p>
          )}

          {!loading && !error && rooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="group bg-card rounded-lg overflow-hidden shadow-sm border border-border animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link to={`/chambres/${room.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
  src={
    room.image
      ? `${BACKEND_URL}${room.image}`
      : "/placeholder-room.jpg"
  }
  alt={room.name}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
/>


                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {room.price} DT / nuit
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link to={`/chambres/${room.slug}`}>
                      <h3 className="font-display text-2xl font-semibold mb-2 hover:text-primary transition-colors">
                        {room.name}
                      </h3>
                    </Link>

                    <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{room.capacity} pers.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>{room.size} m²</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/chambres/${room.slug}`}>
                          {t("rooms.buttons.details")}
                        </Link>
                      </Button>

                      <ReservationModal room={room}>
                        <Button className="flex-1">
                          {t("rooms.buttons.reserve")}
                        </Button>
                      </ReservationModal>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* =======================
         Included Section
      ======================= */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-semibold mb-6">
              {t("rooms.included.title")}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {t("rooms.included.items", { returnObjects: true }).map(
                (item: string) => (
                  <div key={item} className="bg-background p-4 rounded-lg">
                    <p className="font-body text-sm font-medium">{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rooms;

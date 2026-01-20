import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/ReservationModal";
import { Users, Maximize, Check, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

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

/* =======================
   Component
======================= */
const RoomDetail = () => {
  const { slug } = useParams();
  const { t } = useTranslation();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:3000/api/rooms/${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setRoom(data);
      })
      .catch((err) => {
        console.error("❌ Room fetch error:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) return <Navigate to="/chambres" replace />;
  if (notFound) return <Navigate to="/chambres" replace />;
  if (loading) {
    return (
      <Layout>
        <p className="text-center mt-20 text-muted-foreground">
          Chargement de la chambre...
        </p>
      </Layout>
    );
  }

  if (!room) return null;

  const BACKEND_URL = "http://localhost:3000";

const imageUrl = room.image
  ? `${BACKEND_URL}${room.image}`
  : "/placeholder-room.jpg";


  return (
    <Layout>
      {/* =======================
         HERO
      ======================= */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        <div className="relative z-10 container-custom pb-12">
          <Link
            to="/chambres"
            className="flex items-center gap-2 text-white/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("rooms.detail.back")}
          </Link>

          <h1 className="text-5xl font-semibold text-white mb-4">
            {room.name}
          </h1>

          <div className="flex gap-6 text-white/90">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {room.capacity} {t("rooms.detail.people")}
            </span>

            <span className="flex items-center gap-2">
              <Maximize className="w-5 h-5" />
              {room.size} m²
            </span>

            <span className="bg-primary px-4 py-1 rounded-full">
              {room.price} DT / {t("rooms.detail.night")}
            </span>
          </div>
        </div>
      </section>

      {/* =======================
         CONTENT
      ======================= */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-12">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold mb-6">
              {t("rooms.detail.descriptionTitle")}
            </h2>

            <p className="text-muted-foreground mb-8">
              {room.description}
            </p>

            {/* Amenities (statique pour l’instant) */}
            <h3 className="text-2xl font-semibold mb-4">
              {t("rooms.detail.amenitiesTitle")}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {t("rooms.detail.amenities", { returnObjects: true }).map(
                (a: string) => (
                  <div key={a} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{a}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Booking */}
          <div className="bg-secondary rounded-lg p-6 sticky top-24">
            <h3 className="text-2xl font-semibold mb-2">
              {t("reservation.modal.title")}
            </h3>

            <p className="text-sm text-muted-foreground mb-6">
              {t("reservation.modal.subtitle")}
            </p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-primary">
                {room.price} DT
              </span>
              <span>{t("reservation.modal.priceSuffix")}</span>
            </div>

            <ReservationModal room={room}>
              <Button size="lg" className="w-full">
                {t("reservation.modal.submit")}
              </Button>
            </ReservationModal>

            <p className="text-xs text-center mt-4 text-muted-foreground">
              {t("reservation.modal.note")}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RoomDetail;

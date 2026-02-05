import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/ReservationModal";
import { Users, Maximize, Check, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

/* =======================
   Types
======================= */
interface GalleryImage {
  id: number;
  room_id: number;
  url: string;
  order: number;
}

interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  size: number;
  capacity: number;
  image?: string;
  description?: string;
  gallery?: GalleryImage[];
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

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<number>(0);

  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    if (!slug) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms/${slug}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data: Room = await res.json();

        const galleryRes = await fetch(`${BACKEND_URL}/api/admin/gallery/${data.id}`);
        const galleryData: GalleryImage[] = await galleryRes.json();

        setRoom({ ...data, gallery: galleryData });
      } catch (err) {
        console.error("❌ Room fetch error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [slug]);

  if (!slug) return <Navigate to="/chambres" replace />;
  if (notFound) return <Navigate to="/chambres" replace />;
  if (loading)
    return (
      <Layout>
        <p className="text-center mt-20 text-muted-foreground">
          Chargement de la chambre...
        </p>
      </Layout>
    );
  if (!room) return null;

  const imageUrl = room.image
    ? `${BACKEND_URL}${room.image}`
    : "/placeholder-room.jpg";

  return (
    <Layout>
      {/* HERO */}
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

      {/* CONTENT */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-12">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold mb-6">
              {t("rooms.detail.descriptionTitle")}
            </h2>

            <p className="text-muted-foreground mb-8">{room.description}</p>

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

      {/* GALERIE */}
      {room.gallery && room.gallery.length > 0 && (
        <section className="section-padding pt-0">
          <div className="container-custom">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {room.gallery.map((img, idx) => (
    <div
      key={idx}
      className="overflow-hidden rounded-xl cursor-pointer"
      onClick={() => {
        setCurrentImage(idx);
        setLightboxOpen(true);
      }}
    >
      <img
        src={`${BACKEND_URL}${img.url}`}
        alt={`Galerie ${idx + 1}`}
        className="w-full h-48 object-cover"
      />
    </div>
  ))}
</div>

          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && room.gallery && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl z-50"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
            >
              ✕
            </button>

            <motion.img
              key={currentImage}
              src={`${BACKEND_URL}${room.gallery[currentImage].url}`}
              alt={`Galerie ${currentImage + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-lg rounded-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            {currentImage > 0 && (
              <button
                className="absolute left-4 text-white text-3xl z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(currentImage - 1);
                }}
              >
                ‹
              </button>
            )}
            {currentImage < room.gallery.length - 1 && (
              <button
                className="absolute right-4 text-white text-3xl z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(currentImage + 1);
                }}
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default RoomDetail;

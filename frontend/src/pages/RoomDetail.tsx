import { useEffect, useState, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/ReservationModal";
import { Users, Maximize, Check, ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
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

  const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darmamiedida.onrender.com";

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

  const goPrev = useCallback(() => {
    setCurrentImage((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    if (!room?.gallery) return;
    setCurrentImage((i) => Math.min(room.gallery!.length - 1, i + 1));
  }, [room?.gallery]);

  // Navigation clavier dans la lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, goPrev, goNext]);

  if (!slug) return <Navigate to="/chambres" replace />;
  if (notFound) return <Navigate to="/chambres" replace />;

  if (loading)
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground tracking-wide">
            Chargement de la chambre...
          </p>
        </div>
      </Layout>
    );
  if (!room) return null;

  const imageUrl = room.image
    ? `${BACKEND_URL}${room.image}`
    : "/placeholder-room.jpg";

  const amenities = t("rooms.detail.amenities", { returnObjects: true }) as string[];
  const gallery = room.gallery ?? [];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative h-[64vh] min-h-[520px] flex items-end overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="relative z-10 container-custom pb-14"
        >
          <Link
            to="/chambres"
            className="group inline-flex items-center gap-2 text-white/75 hover:text-white mb-8 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("rooms.detail.back")}
          </Link>

          <h1 className="font-serif text-[2.75rem] leading-[1.05] md:text-6xl text-white mb-6 text-balance max-w-2xl">
            {room.name}
          </h1>

          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/95 px-4 py-1.5 rounded-full text-sm">
              <Users className="w-4 h-4" />
              {room.capacity} {t("rooms.detail.people")}
            </span>

            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white/95 px-4 py-1.5 rounded-full text-sm">
              <Maximize className="w-4 h-4" />
              {room.size} m²
            </span>

            <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
              {room.price} DT / {t("rooms.detail.night")}
            </span>
          </div>
        </motion.div>
      </section>

      {/* CONTENT */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-3 gap-16">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-3xl mb-5">
              {t("rooms.detail.descriptionTitle")}
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-12 max-w-[62ch] text-[1.05rem]">
              {room.description}
            </p>

            <h3 className="font-serif text-2xl mb-6">
              {t("rooms.detail.amenitiesTitle")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {amenities.map((a: string, idx: number) => (
                <div
                  key={a}
                  className={`flex items-center gap-3 py-3.5 ${
                    idx !== amenities.length - 1 && idx !== amenities.length - 2
                      ? "border-b border-border/60"
                      : ""
                  }`}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-[0.95rem]">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking */}
          <div className="relative">
            <div className="bg-secondary rounded-2xl p-7 sticky top-24 border border-border/50 shadow-sm">
              <h3 className="font-serif text-2xl mb-1.5">
                {t("reservation.modal.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-7">
                {t("reservation.modal.subtitle")}
              </p>

              <div className="flex items-baseline gap-2 pb-7 mb-7 border-b border-border/60">
                <span className="text-4xl font-serif text-primary">
                  {room.price} DT
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("reservation.modal.priceSuffix")}
                </span>
              </div>

              <ReservationModal room={room}>
                <Button size="lg" className="w-full">
                  {t("reservation.modal.submit")}
                </Button>
              </ReservationModal>

              <p className="text-xs text-center mt-5 text-muted-foreground leading-relaxed">
                {t("reservation.modal.note")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIE */}
      {gallery.length > 0 && (
        <section className="section-padding pt-0">
          <div className="container-custom">
            <h2 className="font-serif text-3xl mb-8">Galerie</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[190px] gap-3">
              {gallery.map((img, idx) => {
                // Mosaïque : la première image occupe un bloc plus large
                const isFeatured = idx === 0;
                return (
                  <button
                    key={img.id ?? idx}
                    type="button"
                    className={`group relative overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isFeatured ? "col-span-2 row-span-2" : ""
                    }`}
                    onClick={() => {
                      setCurrentImage(idx);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={`${BACKEND_URL}${img.url}`}
                      alt={`${room.name} — vue ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && gallery.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-5 right-5 text-white/80 hover:text-white z-50 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="absolute top-6 left-6 text-white/60 text-sm tracking-wide">
              {currentImage + 1} / {gallery.length}
            </span>

            <div className="relative w-full flex items-center justify-center flex-1">
              {currentImage > 0 && (
                <button
                  className="absolute left-2 md:left-6 text-white/70 hover:text-white z-50 p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={`${BACKEND_URL}${gallery[currentImage].url}`}
                  alt={`${room.name} — vue ${currentImage + 1}`}
                  className="max-h-[75vh] max-w-[88vw] object-contain shadow-2xl rounded-lg"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </AnimatePresence>

              {currentImage < gallery.length - 1 && (
                <button
                  className="absolute right-2 md:right-6 text-white/70 hover:text-white z-50 p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>

            {/* Bande de miniatures */}
            {gallery.length > 1 && (
              <div
                className="flex gap-2 mt-5 max-w-[92vw] overflow-x-auto pb-1"
                onClick={(e) => e.stopPropagation()}
              >
                {gallery.map((img, idx) => (
                  <button
                    key={img.id ?? idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      idx === currentImage
                        ? "border-white"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={`${BACKEND_URL}${img.url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default RoomDetail;
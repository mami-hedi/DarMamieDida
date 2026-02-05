import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import photo1 from "@/assets/gallery/photo1.jpeg";
import photo2 from "@/assets/gallery/photo2.jpeg";
import photo3 from "@/assets/gallery/photo3.jpeg";
import photo4 from "@/assets/gallery/photo4.jpeg";
import photo5 from "@/assets/gallery/photo5.jpeg";
import photo6 from "@/assets/gallery/photo6.jpeg";
import photo7 from "@/assets/gallery/photo7.jpeg";
import photo8 from "@/assets/gallery/photo8.jpeg";
import photo9 from "@/assets/gallery/photo9.jpeg";
import photo10 from "@/assets/gallery/photo10.jpeg";
import photo11 from "@/assets/gallery/photo11.jpeg";
import photo12 from "@/assets/gallery/photo12.jpeg";

import heroImage from "@/assets/gallery/photo5.jpeg";

const photos = [
  photo1, photo2, photo3,
  photo4, photo5, photo6,
  photo7, photo8, photo9,
  photo10, photo11, photo12,
];

const Galerie = () => {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % photos.length);
  };
  const prevPhoto = () => {
    if (lightboxIndex !== null)
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  };

  const photosAlt: string[] = t("gallery.photosAlt", { returnObjects: true });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative z-10 text-center container-custom">
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-background mb-4 animate-fade-in">
            {t("gallery.hero.title")}
          </h1>
          <p className="font-body text-lg text-background/90 animate-fade-in animate-delay-200">
            {t("gallery.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Masonry-like Grid Animée */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {photos.map((src, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-xl cursor-pointer shadow-lg group"
                onClick={() => openLightbox(index)}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
              >
                <motion.img
                  src={src}
                  alt={photosAlt[index]}
                  className="w-full h-64 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Animée */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="absolute top-6 right-6 text-white text-3xl" onClick={closeLightbox}>
              <X className="w-8 h-8" />
            </button>
            <button className="absolute left-6 text-white text-3xl" onClick={prevPhoto}>
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button className="absolute right-6 text-white text-3xl" onClick={nextPhoto}>
              <ChevronRight className="w-10 h-10" />
            </button>
            <motion.img
              key={lightboxIndex}
              src={photos[lightboxIndex]}
              alt={photosAlt[lightboxIndex]}
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Section */}
      <section className="section-padding bg-gray-100">
        <div className="container-custom text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 text-foreground">
            {t("gallery.video.title")}
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("gallery.video.description")}
          </p>

          <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/NAbcsYvSi3k"
              title={t("gallery.video.title")}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Galerie;

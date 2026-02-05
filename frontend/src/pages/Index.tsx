import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Home as HomeIcon } from "lucide-react";
import heroImage from "@/assets/gallery/photo7.jpeg";
import gallery1 from "@/assets/gallery/photo1.jpeg";
import gallery2 from "@/assets/gallery/photo2.jpeg";
import gallery3 from "@/assets/gallery/photo3.jpeg";
import gallery4 from "@/assets/gallery/photo4.jpeg";
import gallery5 from "@/assets/gallery/photo5.jpeg";
import gallery6 from "@/assets/gallery/photo6.jpeg";

const galleryImages = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

interface Room {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://darb-b.onrender.com";

const Index = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch first 3 rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms`);
        if (!res.ok) throw new Error("Impossible de récupérer les chambres");
        const data: Room[] = await res.json();
        setRooms(data.slice(0, 3)); // seulement les 3 premières
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative z-10 text-center container-custom">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-background mb-6 animate-fade-in">
            {t("hero.title")}
          </h1>
          <p className="font-body text-lg md:text-xl text-background/90 max-w-2xl mx-auto mb-10 animate-fade-in animate-delay-200">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-300">
            <Button asChild variant="hero" size="lg">
              <Link to="/chambres">{t("hero.btnRooms")}</Link>
            </Button>
            <Button asChild variant="hero-outline" size="lg">
              <Link to="/disponibilite">{t("hero.btnAvailability")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              {t("welcome.title")}
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              {t("welcome.description")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HomeIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {t("welcome.features.rooms.title")}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t("welcome.features.rooms.description")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {t("welcome.features.service.title")}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t("welcome.features.service.description")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {t("welcome.features.family.title")}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {t("welcome.features.family.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              {t("gallery.title")}
            </h2>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              {t("gallery.description")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl aspect-square group shadow-md"
              >
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/galerie" className="flex items-center gap-2">
                {t("gallery.btn")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              {t("rooms.title")}
            </h2>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              {t("rooms.description")}
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Chargement des chambres...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <Link
                  key={room.id}
                  to={`/chambres/${room.slug}`}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                    <img
                      src={
                        room.image
                          ? `${BACKEND_URL}${room.image}`
                          : "/placeholder-room.jpg"
                      }
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-display text-2xl font-semibold text-background mb-2">
                        {room.name}
                      </h3>
                      <p className="font-body text-sm text-background/80">
                        {t("rooms.price", { price: room.price })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/chambres" className="flex items-center gap-2">
                {t("rooms.btn")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Reservation + Google Maps Section */}
      <section className="section-padding bg-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="w-full h-[380px] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d802.7525699733518!2d10.642647770961116!3d36.40894658112434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2stn!4v1767782848246!5m2!1sfr!2stn"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Dar Mamie Dida Location"
              />
            </div>

            <div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 text-foreground">
                {t("reservation.title")}
              </h2>
              <p className="font-body text-muted-foreground max-w-xl mb-8 leading-relaxed">
                {t("reservation.description")}
              </p>
              <Button asChild variant="hero" size="lg">
                <Link to="/disponibilite" className="flex items-center gap-2">
                  {t("reservation.btn")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

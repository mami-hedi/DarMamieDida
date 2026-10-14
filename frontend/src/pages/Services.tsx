import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  Coffee,
  Wifi,
  Car,
  Sun,
  Utensils,
  Heart,
  Waves,
  Trophy,
  Sparkles,
  MapPin,
  Compass,
  Plane,
  Key,
  Bike,
  ChefHat,
  ConciergeBell,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import heroImage from "@/assets/lounge.jpg";
import breakfastImage from "@/assets/gallery/photo4.jpeg";

import transferImg from "@/assets/transfert.jpg";
import carImg from "@/assets/locationvoiture.jpg";
import excursionImg from "@/assets/Excursions.jpg";
import bikeImg from "@/assets/room-sarra.jpg";
import chefImg from "@/assets/room-ghada.jpg";
import conciergeImg from "@/assets/Conciergerie.jpg";

type Item = { title: string; description: string };

// L'ordre des icônes suit l'ordre des éléments dans fr.json / en.json
const mainServiceIcons: LucideIcon[] = [Coffee, Wifi, Car, Sun, Utensils, Heart];
const onRequestIcons: LucideIcon[] = [Plane, Key, Compass, Bike, ChefHat, ConciergeBell];
const activityIcons: LucideIcon[] = [Waves, Trophy, Sparkles, MapPin, Compass, Utensils];
const onRequestImages: string[] = [
  transferImg,
  carImg,
  excursionImg,
  conciergeImg,
  bikeImg,
  chefImg,
];

// Vitesse du carrousel en pixels par seconde (plus grand = plus rapide)
const CAROUSEL_SPEED = 40;

// Déclenche une animation d'apparition quand l'élément entre dans le viewport
const useInView = <T extends HTMLElement>(threshold = 0.15) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

const Services = () => {
  const { t } = useTranslation();

  const list = <T,>(key: string): T[] => {
    const value = t(key, { returnObjects: true }) as unknown;
    return Array.isArray(value) ? (value as T[]) : [];
  };

  const mainServices = list<Item>("services.main");
  const onRequestItems = list<Item>("services.onRequest.items");
  const activities = list<Item>("services.activities.items");
  const breakfastItems = list<string>("services.breakfast.items");

  // Carrousel "Services à la demande" : défilement continu, jamais en pause
  const trackRef = useRef<HTMLDivElement>(null);
  const itemsCount = onRequestItems.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || itemsCount === 0) return;

    let offset = 0;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const half = track.scrollWidth / 2;
      offset += CAROUSEL_SPEED * dt;
      if (half > 0 && offset >= half) offset -= half;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [itemsCount]);

  // Section "Activités & Découvertes" : animation d'apparition
  const { ref: activitiesRef, inView: activitiesInView } = useInView<HTMLDivElement>();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/35 to-foreground/60" />
        </div>
        <div className="relative z-10 text-center container-custom">
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-background mb-4 drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)] animate-fade-in">
            {t("services.hero.title")}
          </h1>
          <p className="font-body text-lg text-background/90 animate-fade-in animate-delay-200">
            {t("services.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Services inclus */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-muted-foreground text-lg">{t("services.intro.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service, index) => {
              const Icon = mainServiceIcons[index] ?? Heart;
              return (
                <div
                  key={service.title}
                  className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Petit-déjeuner */}
      <section className="section-padding bg-secondary">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <img
            src={breakfastImage}
            alt={t("services.breakfast.title")}
            loading="lazy"
            className="rounded-2xl shadow-sm w-full h-full max-h-[420px] object-cover"
          />
          <div>
            <h2 className="font-display text-3xl font-semibold mb-4">
              {t("services.breakfast.title")}
            </h2>
            <p className="text-muted-foreground mb-4">{t("services.breakfast.description")}</p>
            <ul className="space-y-2 text-sm">
              {breakfastItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services à la demande (carrousel) */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              {t("services.onRequest.title")}
            </h2>
            <p className="text-muted-foreground">{t("services.onRequest.intro")}</p>
          </div>
        </div>

        {/* Défilement continu : aucune pause au survol ni au clic */}
        <div className="overflow-hidden select-none">
          <div ref={trackRef} className="flex w-max will-change-transform">
            {[...onRequestItems, ...onRequestItems].map((item, index) => {
              const realIndex = index % onRequestItems.length;
              const Icon = onRequestIcons[realIndex] ?? Heart;
              return (
                <div
                  key={`${item.title}-${index}`}
                  className="w-[300px] md:w-[360px] pr-6 shrink-0"
                >
                  <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden h-full">
                    <div className="relative h-48 md:h-56">
                      <img
                        src={onRequestImages[realIndex]}
                        alt={item.title}
                        draggable={false}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 text-xs font-body font-semibold text-primary bg-background/95 rounded-full px-3 py-1">
                        {t("services.onRequest.badge")}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="container-custom">
          <p className="text-center text-sm text-muted-foreground mt-8">
            {t("services.onRequest.note")}
          </p>
          <div className="text-center mt-6">
            <Button asChild variant="hero" size="lg">
              <Link to="/contact">{t("services.onRequest.button")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Activités & Découvertes */}
      <section className="relative section-padding bg-secondary overflow-hidden">
        {/* Décor : halos doux en arrière-plan */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="container-custom relative">
          {/* En-tête */}
          <div className="max-w-2xl mx-auto text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-5" aria-hidden="true">
              <span className="h-px w-10 bg-primary/40" />
              <Compass className="w-5 h-5 text-primary" />
              <span className="h-px w-10 bg-primary/40" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              {t("services.activities.title")}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t("services.activities.intro")}
            </p>
          </div>

          {/* Grille de cartes */}
          <div
            ref={activitiesRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {activities.map((activity, index) => {
              const Icon = activityIcons[index] ?? MapPin;
              return (
                <article
                  key={activity.title}
                  style={{ transitionDelay: activitiesInView ? `${index * 90}ms` : "0ms" }}
                  className={[
                    "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8",
                    "shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none",
                    "hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl",
                    activitiesInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0",
                  ].join(" ")}
                >
                  {/* Numéro décoratif en filigrane */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 right-4 font-display text-7xl font-bold leading-none text-primary/[0.07] transition-colors duration-500 group-hover:text-primary/15"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Icône */}
                  <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>

                  {/* Texte */}
                  <h3 className="relative font-display text-xl font-semibold mb-2">
                    {activity.title}
                  </h3>
                  <p className="relative text-sm leading-relaxed text-muted-foreground">
                    {activity.description}
                  </p>

                  {/* Flèche discrète au survol */}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="absolute bottom-6 right-6 h-5 w-5 text-primary opacity-0 translate-y-2 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0"
                  />

                  {/* Barre d'accent animée */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full"
                  />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl font-semibold text-primary-foreground mb-4">
            {t("services.cta.title")}
          </h2>
          <p className="text-primary-foreground/80 mb-6">{t("services.cta.description")}</p>
          <Button variant="secondary" asChild>
            <Link to="/chambres">{t("services.cta.button")}</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
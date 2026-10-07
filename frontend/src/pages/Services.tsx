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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import heroImage from "@/assets/lounge.jpg";
import breakfastImage from "@/assets/gallery/photo4.jpeg";

type Item = { title: string; description: string };

// L'ordre des icônes suit l'ordre des éléments dans fr.json / en.json
const mainServiceIcons: LucideIcon[] = [Coffee, Wifi, Car, Sun, Utensils, Heart];
const onRequestIcons: LucideIcon[] = [Plane, Key, Compass, Bike, ChefHat, ConciergeBell];
const activityIcons: LucideIcon[] = [Waves, Trophy, Sparkles, MapPin, Compass, Utensils];

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

      {/* Services à la demande */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              {t("services.onRequest.title")}
            </h2>
            <p className="text-muted-foreground">{t("services.onRequest.intro")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {onRequestItems.map((item, index) => {
              const Icon = onRequestIcons[index] ?? Heart;
              return (
                <div
                  key={item.title}
                  className="relative bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm"
                >
                  <span className="absolute top-4 right-4 text-xs font-body font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
                    {t("services.onRequest.badge")}
                  </span>
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>

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

      {/* Activités */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-semibold text-center mb-4">
            {t("services.activities.title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("services.activities.intro")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity, index) => {
              const Icon = activityIcons[index] ?? MapPin;
              return (
                <div
                  key={activity.title}
                  className="flex gap-5 p-6 md:p-8 bg-card rounded-2xl border border-border shadow-sm"
                >
                  <Icon className="w-6 h-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">{activity.title}</h3>
                    <p className="text-muted-foreground text-sm">{activity.description}</p>
                  </div>
                </div>
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
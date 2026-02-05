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
  Mountain,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import heroImage from "@/assets/lounge.jpg";
import breakfastImage from "@/assets/gallery/photo4.jpeg";

const mainServiceIcons = [Coffee, Wifi, Car, Sun, Utensils, Heart];
const activityIcons = [Waves, Mountain, MapPin, Utensils];

const Services = () => {
  const { t } = useTranslation();

  const mainServices = t("services.main", { returnObjects: true });
  const activities = t("services.activities.items", { returnObjects: true });
  const breakfastItems = t("services.breakfast.items", { returnObjects: true });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative z-10 text-center container-custom">
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-background mb-4 animate-fade-in">
            {t("services.hero.title")}
          </h1>
          <p className="font-body text-lg text-background/90 animate-fade-in animate-delay-200">
            {t("services.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Intro / Description */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-muted-foreground text-lg">
              {t("services.intro.description")}
            </p>
          </div>

          {/* Main Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service: any, index: number) => {
              const Icon = mainServiceIcons[index];
              return (
                <div
                  key={service.title}
                  className="bg-card p-6 md:p-8 rounded-lg border border-border shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Breakfast Section */}
      <section className="section-padding bg-secondary">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <img
            src={breakfastImage}
            alt={t("services.breakfast.title")}
            className="rounded-lg shadow-sm"
          />
          <div>
            <h2 className="font-display text-3xl font-semibold mb-4">
              {t("services.breakfast.title")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("services.breakfast.description")}
            </p>
            <ul className="space-y-2 text-sm">
              {breakfastItems.map((item: string) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-semibold text-center mb-4">
            {t("services.activities.title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("services.activities.intro")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity: any, index: number) => {
              const Icon = activityIcons[index];
              return (
                <div
                  key={activity.title}
                  className="flex gap-5 p-6 md:p-8 bg-card rounded-lg border border-border shadow-sm"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <Icon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl font-semibold text-primary-foreground mb-4">
            {t("services.cta.title")}
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            {t("services.cta.description")}
          </p>
          <Button variant="secondary" asChild>
            <Link to="/chambres">{t("services.cta.button")}</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;

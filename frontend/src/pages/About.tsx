import { Layout } from "@/components/layout/Layout";
import { Heart, Award, Clock, Leaf } from "lucide-react";
import heroImage from "@/assets/gallery/photo10.jpeg";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t("about.values.hospitality.title"),
      description: t("about.values.hospitality.description"),
    },
    {
      icon: Award,
      title: t("about.values.excellence.title"),
      description: t("about.values.excellence.description"),
    },
    {
      icon: Clock,
      title: t("about.values.tradition.title"),
      description: t("about.values.tradition.description"),
    },
    {
      icon: Leaf,
      title: t("about.values.authenticity.title"),
      description: t("about.values.authenticity.description"),
    },
  ];

  const reviews = [
    { name: "Sophie L.", rating: 5, comment: t("about.reviews.r1") },
    { name: "Marc D.", rating: 4, comment: t("about.reviews.r2") },
    { name: "Claire P.", rating: 5, comment: t("about.reviews.r3") },
    { name: "Julien R.", rating: 4, comment: t("about.reviews.r4") },
    { name: "Emma S.", rating: 5, comment: t("about.reviews.r5") },
    { name: "Paul T.", rating: 4, comment: t("about.reviews.r6") },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-foreground/60" />
        </div>

        <div className="relative z-10 text-center">
          <h1 className="font-display text-5xl md:text-6xl text-background mb-4">
            {t("about.hero.title")}
          </h1>
          <p className="text-background/90">
            {t("about.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container-custom grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl mb-6">
              {t("about.story.title")}
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>{t("about.story.p1")}</p>
              <p>{t("about.story.p2")}</p>
              <p>{t("about.story.p3")}</p>
            </div>
          </div>

          <img
            src={heroImage}
            alt="Dar Mamie Dida"
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl mb-4">
              {t("about.values.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("about.values.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div key={i} className="bg-background p-8 rounded-lg text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <value.icon className="text-primary" />
                </div>
                <h3 className="font-display text-xl mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section-padding">
        <div className="container-custom text-center mb-12">
          <h2 className="font-display text-4xl mb-4">
            {t("about.reviews.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("about.reviews.subtitle")}
          </p>
        </div>

        <ReviewsCarousel reviews={reviews} />
      </section>

      {/* Team */}
      <section className="section-padding bg-secondary">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="font-display text-4xl mb-6">
            {t("about.team.title")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("about.team.p1")}
          </p>
          <p className="text-muted-foreground">
            {t("about.team.p2")}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default About;

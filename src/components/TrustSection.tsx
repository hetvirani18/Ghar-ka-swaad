import { ShieldCheck, Utensils, Heart, Clock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Verified",
    description: "All cooks are background verified with hygiene certifications",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Utensils,
    title: "Fresh & Homemade",
    description: "Meals prepared daily with fresh ingredients in clean home kitchens",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Experience the warmth of home-cooked food, just like maa ke haath ka khana",
    color: "text-warm-red",
    bg: "bg-warm-red/10",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "Fresh meals delivered right to your doorstep at your preferred time",
    color: "text-warm-orange",
    bg: "bg-warm-orange/10",
  },
];

export const TrustSection = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold mb-2">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Trust, Our Priority
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We ensure every meal comes with the safety, quality, and love you deserve
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-lg ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

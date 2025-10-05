import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Utensils } from "lucide-react";
import heroImage from "@/assets/hero-cook.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-cream/30 to-secondary">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent border border-accent/20">
                <Utensils className="h-4 w-4" />
                घर का खाना
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">माँ के हाथ का</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-warm-orange to-primary bg-clip-text text-transparent">
                स्वाद घर पर
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Ghar jaisa khana, bas ek click par. Connect with verified home cooks in your locality for daily homemade meals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={(e) => {
                  e.preventDefault();
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        window.location.href = `/cooks?lat=${position.coords.latitude}&lng=${position.coords.longitude}`;
                      },
                      () => {
                        // If geolocation fails, just navigate to /cooks
                        window.location.href = "/cooks";
                      }
                    );
                  } else {
                    window.location.href = "/cooks";
                  }
                }}
              >
                <MapPin className="h-5 w-5" />
                Find Cooks Near You
              </Button>
              
              <Button variant="outline" size="xl" asChild>
                <Link to="/auth?role=cook">
                  <ShieldCheck className="h-5 w-5" />
                  Join as a Cook
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Verified Cooks</p>
                  <p className="text-xs text-muted-foreground">100% Background Checked</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Fresh & Homemade</p>
                  <p className="text-xs text-muted-foreground">Cooked with Love Daily</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Home cook preparing fresh meals"
                className="w-full h-auto object-cover"
              />
              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-background/95 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
                <p className="text-sm font-semibold text-foreground">500+ Happy Customers</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-xs text-muted-foreground">4.8/5.0</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-accent/10 blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-background">
        <svg
          className="absolute bottom-0 w-full h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-background"
          ></path>
        </svg>
      </div>
    </section>
  );
};

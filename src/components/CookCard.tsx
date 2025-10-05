import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { MapPin, Star, ShieldCheck, Flame } from "lucide-react";

interface CookCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  todaysDish: string;
  dishImage: string;
  price: number;
  calories?: number;
  verified?: boolean;
  distance?: number; // Distance in km
}

export const CookCard = ({
  id,
  name,
  image,
  rating,
  reviews,
  location,
  todaysDish,
  dishImage,
  price,
  calories = 350,
  verified = true,
  distance,
}: CookCardProps) => {
  // Use a default image if the dish image is not available
  const defaultDishImage = 'https://res.cloudinary.com/dpezwdjkk/image/upload/v1718612278/homebite/kitchens/placeholder_dish_ghnefh.jpg';
  const defaultCookImage = 'https://res.cloudinary.com/dpezwdjkk/image/upload/v1718612278/homebite/kitchens/placeholder_cook_bbe8jd.jpg';

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Dish Image - Only show if there's a valid dish */}
        {todaysDish && todaysDish !== 'No active meals' && dishImage && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={dishImage}
              alt={todaysDish}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Hide the image container if it fails to load
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
              }}
            />
            {price > 0 && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-background/95 text-foreground hover:bg-background border-0 text-xs font-semibold">
                  ₹{price}
                </Badge>
              </div>
            )}
            {calories > 0 && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Flame className="h-3 w-3 text-primary" />
                  {calories} cal
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Cook Info */}
        <div className="p-3 space-y-2.5">
          {/* Verified Badge */}
          {verified && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent border-0 gap-1 text-xs w-fit">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}

          {/* Cook Details */}
          <div className="flex items-center gap-2.5">
            <img
              src={image || defaultCookImage}
              alt={name}
              className="h-12 w-12 rounded-full object-cover border-2 border-border flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = defaultCookImage;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-base">{name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{location}</span>
                {distance !== undefined && distance > 0 && (
                  <span className="text-xs font-medium text-primary flex-shrink-0">
                    • {distance.toFixed(1)} km
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Dish name if available */}
          {todaysDish && todaysDish !== 'No active meals' && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary truncate">{todaysDish}</span>
            </div>
          )}

          {/* Rating and Action */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
              {reviews > 0 && (
                <span className="text-xs text-muted-foreground">({reviews})</span>
              )}
            </div>

            <Button variant="default" size="sm" asChild className="h-8 text-xs px-3">
              <Link to={`/cooks/${id}`}>View Menu</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

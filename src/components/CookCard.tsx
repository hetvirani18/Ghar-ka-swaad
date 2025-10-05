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
        {/* Dish Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={dishImage || defaultDishImage}
            alt={todaysDish}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // If the image fails to load, use the default image
              e.currentTarget.src = defaultDishImage;
            }}
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-background/95 text-foreground hover:bg-background border-0">
              {price > 0 ? `₹${price}` : 'N/A'}
            </Badge>
          </div>
          {verified && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-accent text-accent-foreground hover:bg-accent border-0 gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-3 w-3 text-primary" />
              {calories} cal
            </Badge>
          </div>
        </div>

        {/* Cook Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={image || defaultCookImage}
              alt={name}
              className="h-12 w-12 rounded-full object-cover border-2 border-border"
              onError={(e) => {
                // If the cook image fails to load, use the default image
                e.currentTarget.src = defaultCookImage;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {location} 
                {distance && <span className="ml-1 text-xs font-medium text-primary">({distance.toFixed(1)} km)</span>}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1">Today's Special</p>
            <p className={`text-base font-semibold ${todaysDish === 'No active meals' ? 'text-muted-foreground italic' : 'text-primary'}`}>
              {todaysDish === 'No active meals' ? 'No meals available today' : todaysDish}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold text-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>

            <Button variant="default" size="sm" asChild>
              <Link to={`/cooks/${id}`}>View Menu</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

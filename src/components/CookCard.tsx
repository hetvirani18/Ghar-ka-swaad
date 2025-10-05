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
        {todaysDish !== 'No active meals' && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={dishImage || defaultDishImage}
              alt={todaysDish}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If the image fails to load, use the default image
                e.currentTarget.src = defaultDishImage;
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-background/95 text-foreground hover:bg-background border-0 text-xs">
                {price > 0 ? `₹${price}` : 'N/A'}
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-primary" />
                {calories} cal
              </Badge>
            </div>
          </div>
        )}

        {/* Cook Info */}
        <div className="p-3 space-y-2">
          {/* Verified Badge at top */}
          {verified && (
            <div className="flex justify-start">
              <Badge className="bg-accent text-accent-foreground hover:bg-accent border-0 gap-1 text-xs">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          )}
          
          {/* Show calories and price for no active meals case */}
          {todaysDish === 'No active meals' && (
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Flame className="h-3 w-3 text-primary" />
                {calories} cal
              </Badge>
              <Badge className="bg-background/95 text-foreground hover:bg-background border-0 text-xs">
                {price > 0 ? `₹${price}` : 'N/A'}
              </Badge>
            </div>
          )}

          <div className="flex items-start gap-2">
            <img
              src={image || defaultCookImage}
              alt={name}
              className="h-10 w-10 rounded-full object-cover border-2 border-border"
              onError={(e) => {
                // If the cook image fails to load, use the default image
                e.currentTarget.src = defaultCookImage;
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm">{name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location} 
                {distance && <span className="ml-1 text-xs font-medium text-primary">({distance.toFixed(1)} km)</span>}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-foreground mb-0.5">Today's Special</p>
            <p className={`text-sm font-semibold ${todaysDish === 'No active meals' ? 'text-muted-foreground italic' : 'text-primary'}`}>
              {todaysDish === 'No active meals' ? 'No meals available today' : todaysDish}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold text-foreground">{rating}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>

            <Button variant="default" size="sm" asChild className="h-7 text-xs">
              <Link to={`/cooks/${id}`}>View Menu</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

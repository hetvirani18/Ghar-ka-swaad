import { ShieldCheck, Flame, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Meal } from "@/types";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

interface MealCardProps {
  meal: Meal;
  cookName?: string;
  showCookInfo?: boolean;
}

export const MealCard = ({ meal, cookName, showCookInfo = true }: MealCardProps) => {
  const { addToCart } = useCart();
  const defaultMealImage = "/placeholder.svg";

  const handleAddToCart = () => {
    if (meal.cookId) {
      // Extract cook ID whether it's a string or an object
      let cookId = "";
      
      if (typeof meal.cookId === 'object') {
        // If cookId is a populated object
        if (meal.cookId && '_id' in meal.cookId) {
          cookId = meal.cookId._id;
        }
      } else if (typeof meal.cookId === 'string') {
        cookId = meal.cookId;
      }
      
      if (cookId) {
        // Create a clean meal object without circular references
        const cleanMeal = {
          ...meal,
          cookId: cookId // Ensure cookId is a string ID
        };
        
        addToCart(cleanMeal, cookId, cookName || "Unknown Cook");
      } else {
        console.error("Invalid cookId format:", meal.cookId);
      }
    } else {
      console.error("No cookId provided for meal:", meal);
    }
  };

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Meal Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={meal.image || defaultMealImage}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // If the image fails to load, use the default image
              e.currentTarget.src = defaultMealImage;
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-background/95 text-foreground hover:bg-background border-0 text-xs">
              ₹{meal.price}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Flame className="h-3 w-3 text-primary" />
              {meal.calories} cal
            </Badge>
          </div>
        </div>

        {/* Meal Info */}
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-foreground line-clamp-1">{meal.name}</h3>
          </div>

          {meal.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{meal.description}</p>
          )}

          {showCookInfo && cookName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>By {cookName}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1.5 border-t border-border">
            <div className="flex gap-2">
              {meal.category && (
                <Badge variant="outline" className="text-xs font-normal">
                  {meal.category}
                </Badge>
              )}
            </div>

            <Button variant="default" size="sm" className="h-7 text-xs" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
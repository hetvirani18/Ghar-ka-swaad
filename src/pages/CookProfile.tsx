import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, ShieldCheck, Clock, Heart, Share2, Phone, MessageCircle, ShoppingCart } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/ui/use-toast";
import { Cook, Meal } from "../types";
import { cooksApi, mealsApi, ordersApi } from "../services/api";
import cook1 from "@/assets/cook-1.jpg";
import foodDal from "@/assets/food-dal.jpg";
import foodParatha from "@/assets/food-paratha.jpg";
import foodRajma from "@/assets/food-rajma.jpg";

const CookProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [cook, setCook] = useState<Cook | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reviews state - will be populated from API
  const [reviews, setReviews] = useState([]);

  // Function to format date relative to current date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Load cook and their meals
  useEffect(() => {
    const loadCookAndMeals = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch cook details
        const cookData = await cooksApi.getById(id);
        setCook(cookData);
        
        // Fetch meals for this cook
        const mealsData = await mealsApi.getByCookId(id);
        setMeals(mealsData);

        // Fetch orders for this cook and filter those with reviews
        const ordersData = await ordersApi.getByCookId(id);
        const reviewsData = ordersData
          .filter(order => order.rating && order.rating > 0)
          .map(order => ({
            name: (order.userId as any)?.name || 'Anonymous User',
            rating: order.rating,
            comment: order.reviewText || '',
            date: formatDate(order.createdAt)
          }));
        
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error loading cook profile:', err);
        setError("Failed to load cook profile. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load cook profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCookAndMeals();
  }, [id, toast]);
  
  const handleAddToCart = (meal: Meal) => {
    if (!cook) return;
    
    addToCart(meal, cook._id, cook.name);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading || !cook) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-40 h-40 bg-muted rounded-2xl mb-4"></div>
            <div className="h-10 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-48 mb-6"></div>
            <div className="h-4 bg-muted rounded w-72"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fallback image if cook doesn't have kitchen images
  const cookImage = cook.kitchenImageUrls?.length > 0 
    ? cook.kitchenImageUrls[0] 
    : cook1;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        {/* Cook Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Cook Photo */}
              <div className="relative">
                <img
                  src={cookImage}
                  alt={cook.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-background shadow-lg"
                />
                <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              </div>

              {/* Cook Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {cook.name}
                </h1>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="text-lg font-semibold text-foreground">
                      {cook.averageRating?.toFixed(1) || "New"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({cook.ratingCount || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{cook.location?.neighborhood || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Delivery: 11 AM - 2 PM, 7 PM - 9 PM</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 max-w-2xl">
                  {cook.bio || "No bio provided by the cook."}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button variant="hero" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Cook
                  </Button>
                  <Button variant="outline" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="ghost" size="lg">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="lg">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="menu" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="menu">Today's Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="about">About Kitchen</TabsTrigger>
            </TabsList>

            {/* Today's Menu */}
            <TabsContent value="menu" className="space-y-6">
              {meals.length === 0 ? (
                <div className="text-center py-12 bg-muted/40 rounded-lg">
                  <div className="mb-4">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No active meals available</h3>
                  <p className="text-muted-foreground">
                    This cook doesn't have any meals available right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meals.map((meal) => (
                    <Card key={meal._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        {meal.image ? (
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted flex items-center justify-center">
                            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg text-foreground">{meal.name}</h3>
                          {meal.description && (
                            <p className="text-sm text-muted-foreground">{meal.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-primary">₹{meal.price}</p>
                              {meal.calories && (
                                <p className="text-xs text-muted-foreground">{meal.calories} calories</p>
                              )}
                            </div>
                            <Button 
                              variant="default"
                              onClick={() => handleAddToCart(meal)}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-muted/40 rounded-lg">
                  <div className="mb-4">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to review this cook after ordering!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((review, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">{review.name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* About Kitchen */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">About My Kitchen</h3>
                    <p className="text-muted-foreground">
                      {cook.bio || "No kitchen description provided by the cook."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Location</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{cook.location?.neighborhood}</p>
                        <p className="text-sm text-muted-foreground">
                          {cook.location?.address || "Full address not provided"}
                        </p>
                        {cook.location?.pincode && (
                          <p className="text-sm text-muted-foreground">
                            Pincode: {cook.location.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {cook.kitchenImageUrls && cook.kitchenImageUrls.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">Kitchen Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cook.kitchenImageUrls.map((image, index) => (
                          <img 
                            key={index} 
                            src={image} 
                            alt={`Kitchen image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Certifications</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-accent" />
                        Verified Cook
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookProfile;

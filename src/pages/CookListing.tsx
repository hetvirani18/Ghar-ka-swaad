import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CookCard } from "../components/CookCard";
import { Button } from "../components/ui/button";
import { Loader2, Search } from "lucide-react";
import { cooksApi } from "../services/api";
import { Cook } from "../types";

const CookListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // We no longer auto-detect or restrict by user location.
  // Always fetch all cooks by default and let users filter manually.
  const { data: cooks, isLoading, isError } = useQuery({
    queryKey: ['cooks', 'all'],
    queryFn: async () => {
      try {
        return await cooksApi.getAll();
      } catch (error) {
        console.error('Failed to fetch cooks:', error);
        return [];
      }
    },
    placeholderData: []
  });
  // keep a simplified topRatedCooks query in case UI references it; we'll derive it client-side if needed
  const topRatedCooks = cooks ? [...cooks].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 6) : [];
  
  // location detection removed — users can filter using search, price and sort controls
  
  // Filter cooks based on search term only
  const filteredCooks = cooks ? cooks
    .filter((cook) => {
      // If no search term, show all cooks
      if (searchTerm === "") return true;
      
      const cookHasMeals = cook.activeMeals && cook.activeMeals.length > 0;
      
      // Search by cook name, location, meal name, specialties, and cuisine types
      return cook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cook.location?.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cook.location?.pincode?.includes(searchTerm) ||
        (cookHasMeals && cook.activeMeals.some(meal => 
          meal.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (cook.specialties && cook.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (cook.cuisineTypes && cook.cuisineTypes.some(cuisine =>
          cuisine.toLowerCase().includes(searchTerm.toLowerCase())));
    })
    // Sort by rating by default
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Find Your Home Cook
            </h1>
            <p className="text-muted-foreground">
              Discover verified home cooks serving delicious meals in your area
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="w-full">
            {/* Cook Grid */}
            <div className="w-full">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredCooks?.length || 0} cooks
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search cooks, dishes, location, or dietary needs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-80"
                  />
                </div>
              </div>

              
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">Unable to load cooks</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : filteredCooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCooks.map((cook) => (
                    <CookCard 
                      key={cook._id}
                      id={cook._id}
                      name={cook.name}
                      image={cook.kitchenImageUrls?.[0] || ''}
                      rating={cook.averageRating || 0}
                      reviews={cook.ratingCount || 0}
                      location={cook.location?.neighborhood || 'Unknown location'}
                      todaysDish={cook.activeMeals?.[0]?.name || ''}
                      dishImage={cook.activeMeals?.[0]?.image || ''}
                      price={cook.activeMeals?.[0]?.price || 0}
                      calories={cook.activeMeals?.[0]?.calories || 0}
                      verified={true}
                      distance={cook.distance}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">No cooks found matching your criteria</p>
                  <div className="flex flex-col gap-2 items-center">
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                    }}>
                      Reset Search
                    </Button>
                    {/* location detection removed */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookListing;

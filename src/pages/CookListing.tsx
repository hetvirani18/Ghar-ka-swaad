import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CookCard } from "../components/CookCard";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Loader2, MapPin, Search, SlidersHorizontal, Compass } from "lucide-react";
import { cooksApi } from "../services/api";
import { Cook } from "../types";
import { toast } from "../hooks/use-toast";

const CookListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [locationSearch, setLocationSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [isLocating, setIsLocating] = useState(false);
  
  // Get geolocation params from URL
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const pincode = searchParams.get('pincode');
  
  // Fetch nearby cooks
  const { data: cooks, isLoading, isError } = useQuery({
    queryKey: ['cooks', lat, lng, pincode],
    queryFn: async () => {
      if (lat && lng) {
        return cooksApi.getNearby(parseFloat(lat), parseFloat(lng));
      } else if (pincode) {
        return cooksApi.getByPincode(pincode);
      }
      return [];
    },
    enabled: !!(lat || lng || pincode),
    placeholderData: []
  });
  
  // Fetch top rated cooks as fallback
  const { data: topRatedCooks, isLoading: isTopRatedLoading } = useQuery({
    queryKey: ['cooks', 'top-rated'],
    queryFn: async () => {
      try {
        // Get all cooks and sort by rating on client-side
        const allCooks = await cooksApi.getAll();
        return allCooks.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 6);
      } catch (error) {
        console.error('Failed to fetch top rated cooks:', error);
        return [];
      }
    },
    enabled: !(lat || lng || pincode), // Only fetch if no location parameters
    placeholderData: []
  });
  
  // Auto-detect location on component mount if no location params
  useEffect(() => {
    if (!lat && !lng && !pincode) {
      // Try to get user's location automatically on first load
      if (navigator.geolocation) {
        try {
          setIsLocating(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setIsLocating(false);
              navigate(`/cooks?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
              toast({
                title: "Location detected",
                description: "Showing cooks near your current location",
                variant: "default"
              });
            },
            (error) => {
              setIsLocating(false);
              console.error("Error getting location:", error);
              
              // Show different messages based on error code
              let errorMsg = "Showing our top-rated cooks instead";
              if (error.code === 1) {
                errorMsg = "Location access denied. Please check browser permissions.";
              } else if (error.code === 2) {
                errorMsg = "Location unavailable. Check your device settings.";
              } else if (error.code === 3) {
                errorMsg = "Location request timed out. Please try again.";
              }
              
              toast({
                title: "Location not available",
                description: errorMsg,
                variant: "default"
              });
            },
            { 
              timeout: 10000, // Increase timeout to 10 seconds
              maximumAge: 60000, // Accept cached positions up to 1 minute old
              enableHighAccuracy: false // Don't require high accuracy for cook discovery
            }
          );
        } catch (e) {
          setIsLocating(false);
          console.error("Geolocation exception:", e);
          toast({
            title: "Location service error",
            description: "Could not access location services. Using top-rated cooks instead.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Geolocation not supported",
          description: "Your browser doesn't support location services. Showing top-rated cooks.",
          variant: "default"
        });
      }
    }
  }, [lat, lng, pincode, navigate]);
  
  // Handle manual location detection
  const detectLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          navigate(`/cooks?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
          toast({
            title: "Location updated",
            description: "Showing cooks near your current location",
            variant: "default"
          });
        },
        (error) => {
          setIsLocating(false);
          console.error("Error getting location:", error);
          toast({
            title: "Location detection failed",
            description: error.message,
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive"
      });
    }
  };
  
  // Filter and sort cooks based on multiple criteria
  const filteredAndSortedCooks = cooks ? cooks
    // First filter
    .filter((cook) => {
      // Filter by price range
      const cookHasMeals = cook.activeMeals && cook.activeMeals.length > 0;
      const priceInRange = cookHasMeals 
        ? cook.activeMeals.some(meal => 
            meal.price >= priceRange[0] && meal.price <= priceRange[1])
        : true;
      
      // Filter by search term (cook name or meal name)
      const matchesSearch = searchTerm === "" || 
        cook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cookHasMeals && cook.activeMeals.some(meal => 
          meal.name.toLowerCase().includes(searchTerm.toLowerCase())));
      
      // Filter by location search if provided
      const matchesLocation = locationSearch === "" || 
        (cook.location?.neighborhood && 
          cook.location.neighborhood.toLowerCase().includes(locationSearch.toLowerCase()));
      
      return priceInRange && matchesSearch && matchesLocation;
    })
    // Then sort
    .sort((a, b) => {
      if (sortBy === 'distance') {
        // Default to 100 if distance is not available
        const distanceA = a.distance ?? 100; 
        const distanceB = b.distance ?? 100;
        return distanceA - distanceB;
      } 
      else if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      } 
      else if (sortBy === 'price') {
        const priceA = a.activeMeals?.[0]?.price ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.activeMeals?.[0]?.price ?? Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      }
      return 0;
    }) : [];

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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                  </div>

                  {/* Location */}
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // If the input contains only digits, assume it's a pincode and redirect
                      if (/^\d+$/.test(locationSearch)) {
                        navigate(`/cooks?pincode=${locationSearch}`);
                      }
                      // Otherwise just use it for filtering the current results
                    }}>
                      <div className="flex">
                        <div className="relative flex-grow">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Enter your area or pincode..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                // Submit the parent form
                                e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                              }
                            }}
                            className="w-full rounded-l-md border border-r-0 border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="rounded-l-none"
                          variant="default"
                        >
                          Search
                        </Button>
                      </div>
                    </form>
                    <div className="flex items-center justify-center mt-2">
                      <Button 
                        type="button" 
                        onClick={detectLocation}
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-2"
                        disabled={isLocating}
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <Compass className="h-3 w-3" />
                            Use my current location
                          </>
                        )}
                      </Button>
                    </div>
                    {/^\d+$/.test(locationSearch) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter a pincode to search for cooks in that area
                      </p>
                    )}
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-foreground">
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-center gap-2 mb-6">
                    <input
                      type="checkbox"
                      id="verified"
                      defaultChecked
                      className="h-4 w-4 rounded border-input"
                    />
                    <label htmlFor="verified" className="text-sm text-foreground">
                      Verified cooks only
                    </label>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-foreground">Sort By</label>
                    <select 
                      className="w-full rounded-md border border-input bg-background pl-3 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating' | 'price')}
                    >
                      <option value="distance">Distance (Nearest First)</option>
                      <option value="rating">Rating (Highest First)</option>
                      <option value="price">Price (Lowest First)</option>
                    </select>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setLocationSearch("");
                      setPriceRange([0, 200]);
                      setSortBy("distance");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </aside>

            {/* Cook Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredAndSortedCooks?.length || 0} cooks near you
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search cooks or dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              
              {isLoading || isLocating || (isTopRatedLoading && !(lat || lng || pincode)) ? (
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
              ) : filteredAndSortedCooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAndSortedCooks.map((cook) => (
                    <CookCard 
                      key={cook._id}
                      id={cook._id}
                      name={cook.name}
                      image={cook.kitchenImageUrls?.[0] || ''}
                      rating={cook.averageRating || 4.5}
                      reviews={cook.ratingCount || 0}
                      location={cook.location?.neighborhood || 'Unknown location'}
                      todaysDish={cook.activeMeals?.[0]?.name || 'No active meals'}
                      dishImage={cook.activeMeals?.[0]?.image || ''}
                      price={cook.activeMeals?.[0]?.price || 0}
                      calories={cook.activeMeals?.[0]?.calories || 350}
                      verified={true}
                      distance={cook.distance}
                    />
                  ))}
                </div>
              ) : topRatedCooks && topRatedCooks.length > 0 ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Top Rated Cooks</h2>
                    <p className="text-sm text-muted-foreground">We couldn't find cooks in your selected area, so here are our highest rated cooks</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {topRatedCooks.map((cook) => (
                      <CookCard 
                        key={cook._id}
                        id={cook._id}
                        name={cook.name}
                        image={cook.kitchenImageUrls?.[0] || ''}
                        rating={cook.averageRating || 4.5}
                        reviews={cook.ratingCount || 0}
                        location={cook.location?.neighborhood || 'Unknown location'}
                        todaysDish={cook.activeMeals?.[0]?.name || 'No active meals'}
                        dishImage={cook.activeMeals?.[0]?.image || ''}
                        price={cook.activeMeals?.[0]?.price || 0}
                        calories={cook.activeMeals?.[0]?.calories || 350}
                        verified={true}
                        distance={cook.distance}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">No cooks found matching your criteria</p>
                  <div className="flex flex-col gap-2 items-center">
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setLocationSearch("");
                      setPriceRange([0, 200]);
                    }}>
                      Reset Filters
                    </Button>
                    <Button variant="default" onClick={detectLocation}>
                      Try Using My Location
                    </Button>
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

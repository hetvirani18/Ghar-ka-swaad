import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { MealCard } from "../components/MealCard";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { mealsApi } from "../services/api";
import { Meal } from "../types";
import { useToast } from "../hooks/use-toast";

const MealListing = () => {
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'popularity'>('price-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get all meals
  const { data: meals, isLoading, isError } = useQuery({
    queryKey: ['meals', 'all'],
    queryFn: async () => {
      try {
        return await mealsApi.getAll();
      } catch (error) {
        console.error('Failed to fetch meals:', error);
        return [];
      }
    },
    placeholderData: []
  });

  const categories = meals 
    ? [...new Set(meals.map(meal => meal.category).filter(Boolean))] 
    : [];
  
  // Filter and sort meals based on criteria
  const filteredAndSortedMeals = meals 
    ? meals
        .filter((meal) => {
          // Filter by price range
          const priceInRange = meal.price >= priceRange[0] && meal.price <= priceRange[1];
          
          // Filter by search term (meal name or description)
          const matchesSearch = searchTerm === "" || 
            meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (meal.description && meal.description.toLowerCase().includes(searchTerm.toLowerCase()));
          
          // Filter by category if selected
          const matchesCategory = selectedCategory ? meal.category === selectedCategory : true;
          
          return priceInRange && matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
          if (sortBy === 'price-asc') {
            return a.price - b.price;
          } 
          else if (sortBy === 'price-desc') {
            return b.price - a.price;
          }
          // For popularity, sort by calories as a proxy (in a real app, this would be by ratings/orders)
          else if (sortBy === 'popularity') {
            return (b.calories || 0) - (a.calories || 0);
          }
          return 0;
        })
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Order Homemade Food
            </h1>
            <p className="text-muted-foreground">
              Browse and order fresh, homemade meals directly from local cooks
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar - Hidden on Mobile */}
            <div className="hidden lg:block">
              <div className="sticky top-20 bg-white p-6 rounded-lg border border-border shadow-sm space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                
                {/* Price Range */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Price Range</h3>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={500}
                    step={10}
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Categories */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Categories</h3>
                  <div className="space-y-1.5">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Sorting */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sort By</h3>
                  <div className="grid gap-2">
                    <Button
                      variant={sortBy === 'price-asc' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('price-asc')}
                    >
                      Price: Low to High
                    </Button>
                    <Button
                      variant={sortBy === 'price-desc' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('price-desc')}
                    >
                      Price: High to Low
                    </Button>
                    <Button
                      variant={sortBy === 'popularity' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('popularity')}
                    >
                      Popularity
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mobile Search & Filter */}
              <div className="lg:hidden">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search meals..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Mobile Filters Expanded */}
                {showFilters && (
                  <div className="bg-white p-4 rounded-lg border border-border shadow-sm mb-6 space-y-4">
                    {/* Price Range */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Price Range (₹{priceRange[0]} - ₹{priceRange[1]})</h3>
                      <Slider
                        value={priceRange}
                        min={0}
                        max={500}
                        step={10}
                        onValueChange={setPriceRange}
                      />
                    </div>
                    
                    {/* Categories */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedCategory === null ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(null)}
                        >
                          All
                        </Button>
                        {categories.map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sorting */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Sort By</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={sortBy === 'price-asc' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy('price-asc')}
                        >
                          Price: Low to High
                        </Button>
                        <Button
                          variant={sortBy === 'price-desc' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy('price-desc')}
                        >
                          Price: High to Low
                        </Button>
                        <Button
                          variant={sortBy === 'popularity' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortBy('popularity')}
                        >
                          Popularity
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Desktop Search */}
              <div className="hidden lg:block relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search meals by name, description..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Results Count and Sort */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredAndSortedMeals.length}</span> meals
                </p>
              </div>
              
              {/* Meals Grid */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError || filteredAndSortedMeals.length === 0 ? (
                <div className="text-center py-12 bg-muted/40 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">
                    {isError ? "Error loading meals" : "No meals found"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isError 
                      ? "There was a problem loading meals. Please try again." 
                      : "Try adjusting your filters or search terms to find more options."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedMeals.map((meal) => {
                    // Handle different possible formats of cookId
                    let cookName = "Unknown Cook";
                    let cookObject = null;
                    
                    if (meal.cookId) {
                      if (typeof meal.cookId === 'object') {
                        // If cookId is a populated object
                        if ('name' in meal.cookId) {
                          cookName = meal.cookId.name;
                          cookObject = meal.cookId;
                        }
                      } else if (typeof meal.cookId === 'string') {
                        // If cookId is just a string ID
                        cookName = "Cook #" + meal.cookId.substring(0, 5);
                      }
                    }
                    
                    return (
                      <MealCard 
                        key={meal._id} 
                        meal={{
                          _id: meal._id,
                          name: meal.name,
                          description: meal.description,
                          image: meal.image,
                          price: meal.price,
                          calories: meal.calories,
                          quantityAvailable: meal.quantityAvailable,
                          isAvailable: meal.isAvailable,
                          category: meal.category,
                          tags: meal.tags,
                          // Ensure cookId is a clean string for consistency
                          cookId: typeof meal.cookId === 'object' && meal.cookId && '_id' in meal.cookId 
                            ? meal.cookId._id 
                            : typeof meal.cookId === 'string' ? meal.cookId : ''
                        }} 
                        cookName={cookName}
                      />
                    );
                  })}
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

export default MealListing;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mealsApi, cooksApi, ordersApi } from '../services/api';
import { Cook, Meal, Order } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash, ShoppingBag, FileText, Clock, Check, X, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../components/ui/use-toast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { OrdersTab } from '../components/OrdersTab';

interface AddMealFormProps {
  cookId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddMealForm = ({ cookId, onSuccess, onCancel }: AddMealFormProps) => {
  const { toast } = useToast();
  const [mealData, setMealData] = useState({
    name: '',
    description: '',
    price: '',
    calories: '',
    quantityAvailable: '',
    category: 'Other'
  });
  const [mealImage, setMealImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { mutate: createMeal, isPending } = useMutation({
    mutationFn: () => {
      // Create a FormData object to send the meal data and image
      const formData = new FormData();
      formData.append('cookId', cookId);
      formData.append('name', mealData.name);
      formData.append('description', mealData.description);
      formData.append('price', mealData.price);
      formData.append('calories', mealData.calories || '0');
      formData.append('quantityAvailable', mealData.quantityAvailable);
      formData.append('category', mealData.category);
      
      // Add the image file
      if (mealImage) {
        formData.append('image', mealImage);
      }
      
      return mealsApi.create(formData);
    },
    onSuccess: () => {
      toast({
        title: 'Meal added successfully',
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add meal',
        description: error.message,
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMealData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMealImage(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!mealData.name || !mealData.price || !mealData.quantityAvailable) {
      toast({
        variant: 'destructive',
        title: 'Please fill all required fields',
      });
      return;
    }
    
    if (!mealImage) {
      toast({
        variant: 'destructive',
        title: 'Please upload a meal image',
      });
      return;
    }
    
    if (isNaN(parseFloat(mealData.price)) || parseFloat(mealData.price) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Please enter a valid price',
      });
      return;
    }
    
    if (isNaN(parseInt(mealData.quantityAvailable)) || parseInt(mealData.quantityAvailable) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Please enter a valid quantity',
      });
      return;
    }
    
    createMeal();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Add New Meal</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 mb-4">
          <div>
            <Label htmlFor="name">Meal Name*</Label>
            <Input
              id="name"
              name="name"
              value={mealData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={mealData.description}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="image">Meal Image*</Label>
            <div className="mt-1 flex items-center">
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="hidden"
              />
              <label
                htmlFor="image"
                className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-input px-3 py-4 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                style={{ width: '100%' }}
              >
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Meal preview"
                      className="h-32 w-auto object-cover rounded-md"
                    />
                    <span className="mt-2">Click to change</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Click to upload</span>
                    <span className="text-xs text-gray-500">(JPG, PNG up to 5MB)</span>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)*</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={mealData.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quantityAvailable">Quantity Available*</Label>
              <Input
                id="quantityAvailable"
                name="quantityAvailable"
                type="number"
                min="1"
                value={mealData.quantityAvailable}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                min="0"
                value={mealData.calories}
                onChange={handleChange}
                placeholder="Approximate calories"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={mealData.category}
                onChange={handleChange}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Dessert">Dessert</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : 'Add Meal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const CookDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [cook, setCook] = useState<Cook | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  
  // Get cook data from location state or from localStorage
  useEffect(() => {
    const cookFromState = location.state?.cook;
    const cookFromStorage = localStorage.getItem('cookProfile');
    
    if (cookFromState) {
      setCook(cookFromState);
      localStorage.setItem('cookProfile', JSON.stringify(cookFromState));
    } else if (cookFromStorage) {
      setCook(JSON.parse(cookFromStorage));
    } else {
      // If no cook data found, redirect to become a cook page
      navigate('/become-a-cook');
    }
  }, [location.state, navigate]);

  const { data: meals, isLoading, refetch } = useQuery({
    queryKey: ['meals', cook?._id],
    queryFn: () => cook?._id ? mealsApi.getByCookId(cook._id) : Promise.resolve([]),
    enabled: !!cook?._id,
  });

  if (!cook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-2">Cook Dashboard</h2>
        <p className="text-gray-500 mb-8">Manage your profile and meals</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Your Profile</h3>
              
              <div className="mb-4">
                <p className="font-medium">Name</p>
                <p>{cook.name}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-medium">Bio</p>
                <p className="text-gray-600">{cook.bio}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-medium">Location</p>
                <p className="text-gray-600">{cook.location.neighborhood}, {cook.location.pincode}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-medium">UPI ID</p>
                <p className="font-mono">{cook.upiId}</p>
              </div>
              
              <div className="mb-4">
                <p className="font-medium">Rating</p>
                <p>
                  {cook.averageRating.toFixed(1)} ★ ({cook.ratingCount} ratings)
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/cooks/${cook._id}`)}
              >
                View Public Profile
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <Tabs defaultValue="meals" className="w-full">
                <TabsList className="mb-6 w-full">
                  <TabsTrigger value="meals" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Your Meals
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex-1">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Orders
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="meals">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Your Meals</h3>
                    <Button onClick={() => setShowAddMeal(true)}>+ Add New Meal</Button>
                  </div>
                  
                  {showAddMeal && (
                    <AddMealForm
                      cookId={cook._id}
                      onSuccess={() => {
                        setShowAddMeal(false);
                        refetch();
                      }}
                      onCancel={() => setShowAddMeal(false)}
                    />
                  )}
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                  ) : !meals || meals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't added any meals yet.</p>
                      {!showAddMeal && (
                        <Button 
                          variant="link" 
                          onClick={() => setShowAddMeal(true)}
                        >
                          Add your first meal
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {meals.map((meal: Meal) => (
                        <div key={meal._id} className="py-4 flex items-center gap-4">
                          {meal.image && (
                            <img 
                              src={meal.image} 
                              alt={meal.name}
                              className="h-16 w-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{meal.name}</h4>
                            <p className="text-orange-600 font-medium">₹{meal.price}</p>
                            <p className="text-sm text-gray-500">
                              {meal.quantityAvailable} portion{meal.quantityAvailable !== 1 ? 's' : ''} available
                              {meal.calories > 0 && ` • ${meal.calories} cal`}
                              {meal.category && ` • ${meal.category}`}
                            </p>
                            {meal.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{meal.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="orders">
                  <h3 className="text-xl font-semibold mb-6">Manage Orders</h3>
                  {cook && <OrdersTab cookId={cook._id} />}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookDashboard;
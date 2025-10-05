import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { cooksApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Upload, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const CookRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    pincode: '',
    neighborhood: '',
    upiId: '',
    specialties: [] as string[],
    cuisineTypes: [] as string[],
    timeSlots: '',
    morning: false,
    afternoon: false,
    evening: false,
  });
  
  const [kitchenImages, setKitchenImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const { mutate: registerCook, isPending } = useMutation({
    mutationFn: () => {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'specialties' || key === 'cuisineTypes') {
          // Send arrays as JSON strings
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'morning' || key === 'afternoon' || key === 'evening') {
          // Send availability as part of availability object
          formDataToSend.append(`availability.${key}`, String(value));
        } else if (key === 'timeSlots') {
          formDataToSend.append('availability.timeSlots', value as string);
        } else {
          formDataToSend.append(key, value as string);
        }
      });
      
      // Append images
      kitchenImages.forEach(image => {
        formDataToSend.append('kitchenImages', image);
      });
      
      return cooksApi.register(formDataToSend);
    },
    onSuccess: (response) => {
      toast({
        title: 'Registration successful',
        description: 'You are now registered as a cook!',
      });
      // Log in the user with the returned user data
      login(response.user);
      // Navigate to cook dashboard
      navigate('/cook-dashboard', { state: { cook: response.cook } });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Server error during cook registration',
      });
    },
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleMultiSelectChange = (field: 'specialties' | 'cuisineTypes', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImages = Array.from(files);
    const newImageUrls = newImages.map(file => URL.createObjectURL(file));
    
    setKitchenImages(prev => [...prev, ...newImages]);
    setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
  };
  
  const removeImage = (index: number) => {
    const newImages = [...kitchenImages];
    const newUrls = [...imagePreviewUrls];
    
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newImages.splice(index, 1);
    newUrls.splice(index, 1);
    
    setKitchenImages(newImages);
    setImagePreviewUrls(newUrls);
  };
  
  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        toast({
          variant: 'destructive',
          title: 'Please fill all required fields',
        });
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          variant: 'destructive',
          title: 'Please enter a valid email address',
        });
        return;
      }
      if (formData.password.length < 6) {
        toast({
          variant: 'destructive',
          title: 'Password must be at least 6 characters',
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.bio || !formData.pincode || !formData.neighborhood || !formData.upiId) {
        toast({
          variant: 'destructive',
          title: 'Please fill all required fields',
        });
        return;
      }
    }
    if (step === 3) {
      if (formData.specialties.length === 0 || formData.cuisineTypes.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Please select at least one specialty and cuisine type',
        });
        return;
      }
      if (!formData.morning && !formData.afternoon && !formData.evening) {
        toast({
          variant: 'destructive',
          title: 'Please select at least one availability time slot',
        });
        return;
      }
    }
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (kitchenImages.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Please upload at least 3 kitchen images',
      });
      return;
    }
    
    registerCook();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 flex justify-center">
        <div className="w-full max-w-lg">
          <h2 className="text-3xl font-bold text-center mb-2">Become a Cook</h2>
          <p className="text-center text-gray-600 mb-6">
            Join our community and start earning from your cooking skills
          </p>
          
          {step === 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📋 Before you start:</strong> Make sure you have at least 3 clear photos of your kitchen ready to upload.
              </p>
            </div>
          )}
          
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`h-1 flex-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`h-1 flex-1 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <div className={`h-1 flex-1 ${step >= 4 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                ${step >= 4 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                4
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full mt-4"
                >
                  Next
                </Button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cook Profile</h3>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell customers about yourself and your cooking"
                    required
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      placeholder="e.g. Andheri West"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 400053"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="upiId">UPI ID (for payments)</Label>
                  <Input
                    id="upiId"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="e.g. yourname@upi"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be shown to customers for direct payments
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties & Availability</h3>
                
                {/* Specialties */}
                <div>
                  <Label className="block mb-2">Dietary Specialties</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select all that apply to your cooking style
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Diabetic-friendly', 'Low-sodium', 'Gluten-free', 'Vegan', 'Heart-healthy', 'Protein-rich', 'Low-carb', 'Keto-friendly'].map((specialty) => (
                      <label key={specialty} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty)}
                          onChange={() => handleMultiSelectChange('specialties', specialty)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Cuisine Types */}
                <div>
                  <Label className="block mb-2">Cuisine Types</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    What type of cuisine do you specialize in?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian', 'Mexican', 'Thai', 'Bengali', 'Gujarati', 'Punjabi'].map((cuisine) => (
                      <label key={cuisine} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.cuisineTypes.includes(cuisine)}
                          onChange={() => handleMultiSelectChange('cuisineTypes', cuisine)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Availability */}
                <div>
                  <Label className="block mb-2">Availability</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    When are you available to prepare meals?
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="morning"
                        checked={formData.morning}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <span className="font-medium">Morning</span>
                        <span className="text-sm text-gray-500 ml-2">(6 AM - 12 PM)</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="afternoon"
                        checked={formData.afternoon}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <span className="font-medium">Afternoon</span>
                        <span className="text-sm text-gray-500 ml-2">(12 PM - 5 PM)</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="evening"
                        checked={formData.evening}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <span className="font-medium">Evening</span>
                        <span className="text-sm text-gray-500 ml-2">(5 PM - 10 PM)</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Specific Time Slots */}
                <div>
                  <Label htmlFor="timeSlots">Specific Time Slots (Optional)</Label>
                  <Input
                    id="timeSlots"
                    name="timeSlots"
                    value={formData.timeSlots}
                    onChange={handleChange}
                    placeholder="e.g., 11 AM - 2 PM, 7 PM - 9 PM"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Specify exact delivery/pickup times if you have preferred slots
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kitchen Photos</h3>
                
                <div className="mb-4">
                  <Label className="block mb-2">Upload at least 3 photos</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload clear photos of your kitchen to build trust with customers
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url}
                          alt={`Kitchen preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {imagePreviewUrls.length < 5 && (
                      <label className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center aspect-square cursor-pointer hover:border-orange-500">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="text-center p-4">
                          <Upload className="h-6 w-6 mx-auto text-gray-400" />
                          <span className="text-sm text-gray-500">Upload</span>
                        </div>
                      </label>
                    )}
                  </div>
                  
                  {kitchenImages.length < 3 && (
                    <p className="text-amber-600 text-sm">
                      Please upload at least {3 - kitchenImages.length} more image{kitchenImages.length < 2 ? 's' : ''}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isPending || kitchenImages.length < 3}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : 'Register as Cook'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookRegistration;
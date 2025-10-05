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

const CookRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    pincode: '',
    neighborhood: '',
    upiId: '',
  });
  
  const [kitchenImages, setKitchenImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const { mutate: registerCook, isPending } = useMutation({
    mutationFn: () => {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Append images
      kitchenImages.forEach(image => {
        formDataToSend.append('kitchenImages', image);
      });
      
      return cooksApi.register(formDataToSend);
    },
    onSuccess: (cook) => {
      toast({
        title: 'Registration successful',
        description: 'You are now registered as a cook!',
      });
      navigate('/cook-dashboard', { state: { cook } });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
    },
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!formData.name || !formData.bio || !formData.pincode || !formData.neighborhood || !formData.upiId) {
        toast({
          variant: 'destructive',
          title: 'Please fill all required fields',
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
          <h2 className="text-3xl font-bold text-center mb-6">Become a Cook</h2>
          
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-xs flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`h-1 flex-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
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
              <div>
                <div className="mb-4">
                  <Label className="block mb-2">Kitchen Photos (at least 3)</Label>
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
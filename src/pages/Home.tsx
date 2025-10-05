import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { FeaturedCooks } from "../components/FeaturedCooks";
import { TrustSection } from "../components/TrustSection";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { MapPin, AlertCircle } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/ui/alert";

const Home = () => {
  const navigate = useNavigate();
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pincode, setPincode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);

  // Do not auto-request geolocation on mount; allow the user to opt-in via button

  const requestGeolocation = () => {
    // Geolocation disabled by default to avoid unexpected permissions/prompts.
    // If users want to filter by location, they can enter pincode above or use the filters on the cooks page.
    setLocationStatus('error');
    setErrorMessage('Automatic location detection is disabled. Please enter your pincode or use filters on the cooks page.');
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length < 6) {
      setErrorMessage('Please enter a valid pincode');
      return;
    }
    
    navigate(`/cooks?pincode=${pincode}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        
        {/* Location Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Find Home Cooks</h2>
              
              {locationStatus === 'error' && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Location Access Required</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              {locationStatus === 'loading' && (
                <div className="flex justify-center items-center mb-6">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                  <p>Getting your location...</p>
                </div>
              )}
              
              <div className="mt-4">
                <form onSubmit={handlePincodeSubmit} className="flex gap-2 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="text"
                      placeholder="Enter your pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={requestGeolocation}
                  disabled={locationStatus === 'loading'}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Use my current location
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <FeaturedCooks />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;

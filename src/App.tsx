import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import CookListing from "./pages/CookListing";
import CookProfile from "./pages/CookProfile";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import CookRegistration from "./pages/CookRegistration";
import CookDashboard from "./pages/CookDashboard";
import CookAnalytics from "./pages/CookAnalytics";
import Orders from "./pages/Orders";
import MealListing from "./pages/MealListing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cooks" element={<CookListing />} />
              <Route path="/cooks/:id" element={<CookProfile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/become-a-cook" element={<CookRegistration />} />
              <Route path="/cook-dashboard" element={<CookDashboard />} />
              <Route path="/cook-analytics" element={<CookAnalytics />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/meals" element={<MealListing />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

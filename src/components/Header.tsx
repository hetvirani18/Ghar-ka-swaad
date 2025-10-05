import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { 
  ChefHat, 
  LogOut, 
  Settings, 
  User,
  ChevronDown,
  Home,
  FileText,
  Users,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Cart } from "./Cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-warm-orange">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">HomeBite</span>
            <span className="text-[10px] text-muted-foreground -mt-1">घर का खाना</span>
          </div>
        </Link>

        {/* Main Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link 
            to="/cooks" 
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
            onClick={(e) => {
              // If already on the cooks page, use current location
              if (window.location.pathname === "/cooks") {
                e.preventDefault();
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      window.location.href = `/cooks?lat=${position.coords.latitude}&lng=${position.coords.longitude}`;
                    },
                    () => {
                      // If geolocation fails, just navigate to /cooks
                      window.location.href = "/cooks";
                    }
                  );
                }
              }
            }}
          >
            <Users className="h-4 w-4" />
            Find Cooks
          </Link>
          {user?.role === 'cook' && (
            <Link to="/cook-dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          {user?.role === 'user' && (
            <Link to="/orders" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </Link>
          )}
        </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Cart />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-1">
                  <User className="h-4 w-4" />
                  {user?.name?.split(' ')[0]}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                
                {user?.role === 'cook' ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/cook-dashboard" className="w-full cursor-pointer">
                        <ChefHat className="mr-2 h-4 w-4" />
                        Cook Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="w-full cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Order Requests
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="w-full cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                {user?.role === 'user' && (
                  <DropdownMenuItem asChild>
                    <Link to="/become-a-cook" className="w-full cursor-pointer">
                      <ChefHat className="mr-2 h-4 w-4" />
                      Become a Cook
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout} 
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/auth">
                  <User className="h-4 w-4 mr-1" />
                  Login
                </Link>
              </Button>
    
              <Button variant="hero" size="sm" asChild className="hidden sm:flex">
                <Link to="/auth?role=cook">Join as Cook</Link>
              </Button>
            </>
          )}
        </div>
      </div>

    </header>
  );
};

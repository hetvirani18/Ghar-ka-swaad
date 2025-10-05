import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ChefHat, Loader2, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../services/api";
import { useToast } from "../components/ui/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "customer";
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  // Form states
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: ''
  });
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Handle input change for signup form
  const handleSignupChange = (e) => {
    const { id, value } = e.target;
    setSignupForm(prev => ({ ...prev, [id]: value }));
  };
  
  // Handle input change for login form
  const handleLoginChange = (e) => {
    const { id, value } = e.target;
    const field = id.replace('login-', '');
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => {
      return selectedRole === 'cook' 
        ? authApi.registerCook(userData) 
        : authApi.register(userData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
        variant: "default",
      });
      login(data);
      if (selectedRole === 'cook') {
        navigate('/cook-dashboard');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
        variant: "default",
      });
      login(data);
      if (data.role === 'cook') {
        navigate('/cook-dashboard');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submissions
  const handleSignup = (e) => {
    e.preventDefault();
    const userData = {
      ...signupForm,
      role: selectedRole
    };
    registerMutation.mutate(userData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-background via-cream/20 to-secondary/30 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome to HomeBite
            </h1>
            <p className="text-muted-foreground">
              Join our community of food lovers and home cooks
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Selection Cards */}
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-all ${
                  selectedRole === "customer"
                    ? "border-primary shadow-lg ring-2 ring-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole("customer")}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      I'm a Customer
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Order delicious home-cooked meals from verified cooks
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  selectedRole === "cook"
                    ? "border-primary shadow-lg ring-2 ring-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole("cook")}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <ChefHat className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      I'm a Cook
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share your cooking skills and earn from home
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    {selectedRole === "cook" ? "Cook Benefits" : "Customer Benefits"}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {selectedRole === "cook" ? (
                      <>
                        <li>✓ Earn from your cooking skills</li>
                        <li>✓ Flexible working hours</li>
                        <li>✓ Verified customer base</li>
                        <li>✓ Full support & training</li>
                      </>
                    ) : (
                      <>
                        <li>✓ 100% verified home cooks</li>
                        <li>✓ Fresh homemade meals daily</li>
                        <li>✓ Transparent pricing</li>
                        <li>✓ On-time delivery</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Auth Forms */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedRole === "cook" ? "Join as a Cook" : "Get Started"}
                </CardTitle>
                <CardDescription>
                  Enter your details to create an account or sign in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signup">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="login">Login</TabsTrigger>
                  </TabsList>

                  {/* Sign Up Form */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Enter your name" 
                            value={signupForm.name}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="your@email.com" 
                            value={signupForm.email}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+91 98765 43210" 
                            value={signupForm.phone}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            placeholder="Create a password" 
                            value={signupForm.password}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                        {selectedRole === "cook" && (
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input 
                              id="location" 
                              placeholder="Your area/locality" 
                              value={signupForm.location}
                              onChange={handleSignupChange}
                              required={selectedRole === "cook"}
                            />
                          </div>
                        )}
                        <Button 
                          className="w-full" 
                          variant="hero" 
                          size="lg" 
                          type="submit"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>
                    </form>
                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our Terms & Privacy Policy
                    </p>
                  </TabsContent>

                  {/* Login Form */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email or Phone</Label>
                          <Input 
                            id="login-email" 
                            placeholder="your@email.com" 
                            value={loginForm.email}
                            onChange={handleLoginChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input 
                            id="login-password" 
                            type="password" 
                            placeholder="Enter password" 
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            required
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            Remember me
                          </label>
                          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <Button 
                          className="w-full" 
                          variant="hero" 
                          size="lg"
                          type="submit"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;

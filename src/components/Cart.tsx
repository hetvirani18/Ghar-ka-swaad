import React from 'react';
import { Button } from './ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from './ui/sheet';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { useToast } from './ui/use-toast';
import { Separator } from './ui/separator';

export const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to place an order",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    // Group cart items by cook
    const itemsByCook = cartItems.reduce((acc, item) => {
      if (!acc[item.cookId]) {
        acc[item.cookId] = [];
      }
      acc[item.cookId].push(item);
      return acc;
    }, {} as Record<string, typeof cartItems>);
    
    setIsCheckingOut(true);
    
    try {
      // Create an order for each cook
      for (const [cookId, items] of Object.entries(itemsByCook)) {
        for (const item of items) {
          await ordersApi.create({
            userId: user!._id,
            cookId: cookId,
            mealId: item.meal._id!
          });
        }
      }
      
      toast({
        title: "Order placed successfully!",
        description: "You can track your orders in the 'My Orders' section",
      });
      
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast({
        title: "Failed to place order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Start adding delicious homemade meals to your cart
            </p>
            <SheetClose asChild>
              <Button variant="outline" asChild>
                <Link to="/cooks">Browse Cooks</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              {/* Group items by cook */}
              {Object.entries(
                cartItems.reduce((acc, item) => {
                  if (!acc[item.cookId]) {
                    acc[item.cookId] = {
                      cookName: item.cookName,
                      items: []
                    };
                  }
                  acc[item.cookId].items.push(item);
                  return acc;
                }, {} as Record<string, { cookName: string; items: typeof cartItems }>)
              ).map(([cookId, { cookName, items }]) => (
                <div key={cookId} className="mb-6">
                  <h3 className="font-medium text-sm px-1">{cookName}</h3>
                  <Separator className="my-2" />
                  
                  {items.map((item) => (
                    <div key={item.meal._id} className="flex items-start gap-3 mb-3 pb-3 border-b last:border-0">
                      {item.meal.image ? (
                        <img 
                          src={item.meal.image} 
                          alt={item.meal.name} 
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.meal.name}</h4>
                        <p className="text-sm text-muted-foreground">₹{item.meal.price}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 rounded-none"
                              onClick={() => updateQuantity(item.meal._id!, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 rounded-none"
                              onClick={() => updateQuantity(item.meal._id!, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => removeFromCart(item.meal._id!)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full"
                >
                  {isCheckingOut ? "Placing Order..." : "Checkout Now"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
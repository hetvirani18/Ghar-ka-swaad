import React, { useState } from 'react';
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
import { ordersApi, cooksApi, paymentApi } from '../services/api';
import { useToast } from './ui/use-toast';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from './ui/dialog';

interface PaymentInfo {
  cookId: string;
  cookName: string;
  upiId: string;
  totalAmount: number;
  items: any[];
}

export const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[]>([]);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Group cart items by cook
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof cartItems> = {};
    cartItems.forEach(item => {
      if (!groups[item.cookId]) {
        groups[item.cookId] = [];
      }
      groups[item.cookId].push(item);
    });
    return groups;
  }, [cartItems]);
  
  // Calculate total for each cook
  const calculateCookTotals = () => {
    return Object.entries(groupedItems).map(([cookId, items]) => {
      const totalAmount = items.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
      return { cookId, items, totalAmount };
    });
  };

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
    
    // Validate all items have proper IDs
    const invalidItems = cartItems.filter(
      item => !item.cookId || !item.meal._id || typeof item.cookId !== 'string'
    );
    
    if (invalidItems.length > 0) {
      console.error('Invalid cart items:', invalidItems);
      toast({
        title: "Invalid items in cart",
        description: "Some items in your cart have invalid data. Please try removing and adding them again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckingOut(true);
    
    try {
      // Calculate totals per cook
      const cookTotals = calculateCookTotals();
      
      // Fetch payment info for each cook
      const paymentDetails = await Promise.all(
        cookTotals.map(async ({ cookId, items, totalAmount }) => {
          try {
            const paymentInfo = await paymentApi.getCookPaymentDetails(cookId);
            return {
              cookId,
              cookName: paymentInfo.name,
              upiId: paymentInfo.upiId || 'No UPI ID provided',
              totalAmount,
              items
            };
          } catch (error) {
            console.error(`Error fetching payment details for cook ${cookId}:`, error);
            // Fallback to cook name from the first item if payment API fails
            const cookName = items[0]?.cookName || 'Unknown Cook';
            return {
              cookId,
              cookName,
              upiId: 'UPI information unavailable',
              totalAmount,
              items
            };
          }
        })
      );
      
      setPaymentInfo(paymentDetails);
      setPaymentDialogOpen(true);
    } catch (error) {
      console.error('Error preparing checkout:', error);
      toast({
        title: "Failed to prepare checkout",
        description: "There was an error preparing your checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  const handleConfirmPayment = async () => {
    setIsCheckingOut(true);
    
    try {
      // Create orders for all items
      const orders = cartItems.map(item => ({
        userId: user!._id,
        cookId: item.cookId,
        mealId: item.meal._id as string,
        quantity: item.quantity
      }));
      
      // Submit all orders
      await ordersApi.createMultiple(orders);
      
      setPaymentComplete(true);
      clearCart(); // Clear cart immediately after successful order creation
      toast({
        title: "Order placed successfully!",
        description: "You can track your orders in the 'My Orders' section",
      });
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Failed to place order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
      setPaymentDialogOpen(false);
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  const handleClosePaymentDialog = (open: boolean) => {
    if (!open) {
      const wasPaymentComplete = paymentComplete;
      setPaymentDialogOpen(false);
      setPaymentComplete(false); // Reset payment complete state
      
      if (wasPaymentComplete) {
        navigate('/orders');
      }
    }
  };
  
  return (
    <React.Fragment>
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
    
    {/* Payment Dialog */}
    <Dialog open={paymentDialogOpen} onOpenChange={handleClosePaymentDialog}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {paymentComplete ? 'Order Placed Successfully!' : 'Complete Payment'}
          </DialogTitle>
          {!paymentComplete && (
            <DialogDescription>
              Please make payments to the following UPI IDs before confirming your order.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {paymentComplete ? (
          <div className="py-4">
            <p>Thank you for your order! Your food will be prepared by our talented home cooks.</p>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {paymentInfo.map((info, index) => (
              <div key={info.cookId} className="space-y-2">
                <h3 className="font-medium text-lg">{info.cookName}</h3>
                <p className="font-medium">Total Amount: ₹{info.totalAmount.toFixed(2)}</p>
                <p className="font-medium text-primary">UPI ID / GPay: <span className="bg-muted px-2 py-1 rounded">{info.upiId}</span></p>
                
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Items:</p>
                  {info.items.map(item => (
                    <p key={item.meal._id} className="text-sm text-muted-foreground">
                      {item.meal.name} x{item.quantity}: ₹{(item.meal.price * item.quantity).toFixed(2)}
                    </p>
                  ))}
                </div>
                
                {index < paymentInfo.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
            
            <p className="text-sm text-muted-foreground mt-4">
              After making the payment through your UPI app, click the button below to confirm.
            </p>
          </div>
        )}
        
        <DialogFooter>
          {paymentComplete ? (
            <Button onClick={() => setPaymentDialogOpen(false)} className="w-full">
              View My Orders
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Button 
                onClick={handleConfirmPayment} 
                className="w-full" 
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "I've Made the Payment"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPaymentDialogOpen(false)} 
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </React.Fragment>
  );
};
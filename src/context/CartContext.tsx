import React, { createContext, useState, useContext, useEffect } from 'react';
import { Meal } from '../types';
import { useToast } from '../components/ui/use-toast';

export interface CartItem {
  meal: Meal;
  quantity: number;
  cookId: string;
  cookName: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (meal: Meal, cookId: string, cookName: string) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Load cart from local storage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
    }
  }, []);

  // Update local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate total price and count
    const total = cartItems.reduce(
      (sum, item) => sum + (item.meal.price * item.quantity), 
      0
    );
    setCartTotal(total);
    
    const count = cartItems.reduce(
      (sum, item) => sum + item.quantity, 
      0
    );
    setCartCount(count);
  }, [cartItems]);

  const addToCart = (meal: Meal, cookId: string, cookName: string) => {
    setCartItems(prevItems => {
      // Check if we already have this meal in cart
      const existingItemIndex = prevItems.findIndex(
        item => item.meal._id === meal._id
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        
        toast({
          title: "Item quantity updated",
          description: `${meal.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        });
        
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: "Item added to cart",
          description: `${meal.name} has been added to your cart`,
        });
        
        return [...prevItems, { 
          meal, 
          quantity: 1,
          cookId,
          cookName
        }];
      }
    });
  };

  const removeFromCart = (mealId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.meal._id === mealId);
      
      if (itemToRemove) {
        toast({
          title: "Item removed",
          description: `${itemToRemove.meal.name} has been removed from your cart`,
        });
      }
      
      return prevItems.filter(item => item.meal._id !== mealId);
    });
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(mealId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.meal._id === mealId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
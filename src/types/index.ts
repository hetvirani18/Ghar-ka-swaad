export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'cook' | 'admin';
  phone?: string;
}

export interface Cook {
  _id: string;
  userId?: string;
  name: string;
  bio?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    pincode?: string;
    neighborhood: string;
    address?: string;
  };
  kitchenImageUrls: string[];
  upiId?: string;
  averageRating: number;
  ratingCount: number;
  activeMeals?: Meal[];
  distance?: number; // In kilometers, calculated from user's location
  createdAt?: string;
}

export interface Meal {
  _id?: string;
  cookId?: string | Cook;
  name: string;
  description?: string;
  image?: string;
  price: number;
  calories?: number;
  quantityAvailable?: number;
  isAvailable?: boolean;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

export interface Order {
  _id: string;
  userId: string;
  cookId: string;
  mealId: string | Meal;
  status: 'Placed' | 'Completed' | 'Cancelled';
  rating?: number;
  reviewText?: string;
  createdAt: string;
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ordersApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Order } from '../types';

interface OrderWithDetails extends Order {
  cookName?: string;
  mealName?: string;
}

const RatingModal = ({ 
  orderId, 
  onClose, 
  onSuccess 
}: { 
  orderId: string; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const { mutate: rateOrder, isPending } = useMutation({
    mutationFn: () => ordersApi.rateOrder(orderId, { rating, reviewText: review }),
    onSuccess: () => {
      toast({
        title: 'Thank you for your feedback!',
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to submit rating',
        description: error.message,
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Rate your experience</h3>
        
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-8 w-8 cursor-pointer ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        
        <Textarea
          placeholder="Share your experience (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="mb-4"
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => rateOrder()} 
            disabled={isPending || rating === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : 'Submit Rating'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnPath: '/profile' } });
    }
  }, [isAuthenticated, navigate]);

  const { 
    data: orders, 
    isLoading, 
    refetch
  } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: () => user?._id ? ordersApi.getByUserId(user._id) : Promise.resolve([]),
    enabled: !!user?._id,
  });

  // Process orders to display meal and cook info
  const processedOrders: OrderWithDetails[] = orders?.map((order: any) => ({
    ...order,
    cookName: order.cookId?.name || 'Unknown Cook',
    mealName: order.mealId?.name || 'Unknown Meal',
  })) || [];

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h2 className="text-3xl font-bold mb-6">My Profile</h2>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <p className="mb-2"><span className="font-medium">Name:</span> {user?.name}</p>
          <p><span className="font-medium">Email:</span> {user?.email}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">My Orders</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : processedOrders.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              You haven't placed any orders yet.
            </p>
          ) : (
            <div className="divide-y">
              {processedOrders.map((order) => (
                <div key={order._id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{order.mealName}</h4>
                      <p className="text-gray-600">from {order.cookName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                      
                      {order.rating ? (
                        <div className="flex items-center justify-end mt-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="ml-1">{order.rating}</span>
                        </div>
                      ) : order.status === 'Placed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setRatingOrderId(order._id)}
                        >
                          Rate Order
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  
                  {order.reviewText && (
                    <div className="mt-2 italic text-gray-600">
                      "{order.reviewText}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {ratingOrderId && (
        <RatingModal
          orderId={ratingOrderId}
          onClose={() => setRatingOrderId(null)}
          onSuccess={refetch}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default UserProfile;
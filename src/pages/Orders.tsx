import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../services/api";
import { Order as OrderType } from "../types";
import { Calendar, ChevronRight, Loader2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const OrderStatusBadge = ({ status }: { status: string }) => {
  let bgColor = "";
  
  switch (status) {
    case "Placed":
      bgColor = "bg-yellow-100 text-yellow-800";
      break;
    case "Completed":
      bgColor = "bg-green-100 text-green-800";
      break;
    case "Cancelled":
      bgColor = "bg-red-100 text-red-800";
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

const RatingStars = ({ rating = 0 }: { rating?: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const OrderCard = ({ order }: { order: OrderType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const [ratingInput, setRatingInput] = useState(order.rating || 0);
  const [reviewText, setReviewText] = useState(order.reviewText || "");
  
  const canRate = order.status === "Completed" && !order.rating;
  
  const handleRatingSubmit = async () => {
    try {
      await ordersApi.rateOrder(order._id, {
        rating: ratingInput,
        reviewText,
      });
      
      toast({
        title: "Rating submitted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to submit rating",
      });
    }
  };
  
  const mealName = typeof order.mealId === 'string' ? 'Meal' : order.mealId.name;
  const cookName = typeof order.cookId === 'string' ? 'Cook' : order.cookId.name;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{mealName}</h3>
          <p className="text-muted-foreground text-sm">from {cookName}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Ordered {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
      </div>
      
      {order.rating && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <RatingStars rating={order.rating} />
            <span className="text-sm font-medium">{order.rating.toFixed(1)}</span>
          </div>
          {order.reviewText && <p className="text-sm mt-1 italic">"{order.reviewText}"</p>}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs flex items-center gap-1 px-0"
        >
          {isExpanded ? "Hide details" : "View details"}
          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </Button>
        
        {canRate && (
          <Button size="sm" variant="outline" onClick={() => setIsExpanded(true)}>
            Rate Order
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-3 border-t">
          {canRate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= ratingInput
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Review (Optional)</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Share your experience..."
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
              </div>
              
              <Button onClick={handleRatingSubmit}>Submit Rating</Button>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Order ID:</span>{" "}
                <span className="font-mono text-xs">{order._id}</span>
              </p>
              <p>
                <span className="font-medium">Status:</span> {order.status}
              </p>
              <p>
                <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);
  
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ["orders", user?._id],
    queryFn: () => (user?._id ? ordersApi.getByUserId(user._id) : Promise.resolve([])),
    enabled: !!user?._id,
  });
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Orders</h1>
          <p className="text-muted-foreground mb-6">Track and manage your orders</p>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <p className="text-muted-foreground mb-2">Failed to load your orders</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-12 bg-muted/40 rounded-lg">
              <h3 className="font-medium text-lg mb-2">You haven't placed any orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Explore our home cooks and order some delicious homemade food!
              </p>
              <Button onClick={() => navigate("/cooks")}>Find Home Cooks</Button>
            </div>
          ) : (
            <div>
              {orders?.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;
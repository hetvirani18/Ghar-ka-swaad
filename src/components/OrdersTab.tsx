import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/api';
import { Order } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, Check, X, AlertTriangle, ShoppingBag, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../components/ui/use-toast';

interface OrdersTabProps {
  cookId: string;
}

const OrderStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Placed':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Completed
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">{status}</Badge>
      );
  }
};

export const OrdersTab = ({ cookId }: OrdersTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['cookOrders', cookId],
    queryFn: () => ordersApi.getByCookId(cookId),
  });
  
  const { mutate: updateOrderStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) => 
      ordersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookOrders', cookId] });
      toast({
        title: 'Order status updated',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed to update order status',
      });
    },
  });
  
  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus({ orderId, status: newStatus });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-gray-500">Failed to load orders.</p>
        <Button 
          variant="link" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['cookOrders', cookId] })}
        >
          Try again
        </Button>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 p-8 rounded-lg inline-block mb-4">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-gray-500 mt-1">
          You haven't received any orders yet. Orders will appear here once customers place them.
        </p>
      </div>
    );
  }
  
  // Group orders by status
  const pendingOrders = orders.filter(order => order.status === 'Placed');
  const completedOrders = orders.filter(order => order.status === 'Completed');
  const cancelledOrders = orders.filter(order => order.status === 'Cancelled');
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Pending Orders ({pendingOrders.length})</h3>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending orders.</p>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => {
              const mealName = typeof order.mealId === 'string' ? 'Meal' : order.mealId.name;
              return (
                <div key={order._id} className="bg-white border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-start gap-2">
                      <OrderStatusBadge status={order.status} />
                      <h4 className="font-medium">{mealName}</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Ordered {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end md:self-auto">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleStatusUpdate(order._id, 'Completed')}
                      disabled={isUpdating}
                    >
                      {isUpdating && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Complete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Completed Orders ({completedOrders.length})</h3>
        {completedOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed orders.</p>
        ) : (
          <div className="space-y-2">
            {completedOrders.map((order) => {
              const mealName = typeof order.mealId === 'string' ? 'Meal' : order.mealId.name;
              return (
                <div key={order._id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <h4 className="font-medium">{mealName}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Completed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {order.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-sm font-medium mr-1">★ {order.rating}</span>
                        <span className="text-xs text-gray-500">rated</span>
                      </div>
                    )}
                  </div>
                  {order.reviewText && (
                    <p className="text-sm italic mt-2 bg-gray-50 p-2 rounded">
                      "{order.reviewText}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {cancelledOrders.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Cancelled Orders ({cancelledOrders.length})</h3>
          <div className="space-y-2">
            {cancelledOrders.map((order) => {
              const mealName = typeof order.mealId === 'string' ? 'Meal' : order.mealId.name;
              return (
                <div key={order._id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <h4 className="font-medium">{mealName}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Cancelled {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
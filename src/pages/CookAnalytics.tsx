import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersApi, mealsApi } from '../services/api';
import { Order, Meal, RevenueData, MealRevenueData } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, ShoppingBag, Star, Download, 
  Calendar, FileText, Mail 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const CookAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [cookId, setCookId] = useState<string>('');

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user || user.role !== 'cook') {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        
        // Get cook ID from localStorage
        const cookProfile = localStorage.getItem('cookProfile');
        if (cookProfile) {
          const cook = JSON.parse(cookProfile);
          setCookId(cook._id);
          
          // Fetch orders for this cook
          const ordersData = await ordersApi.getByCookId(cook._id);
          setOrders(ordersData);
          
          // Fetch meals for this cook
          const mealsData = await mealsApi.getByCookId(cook._id);
          setMeals(mealsData);
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user, navigate]);

  // Calculate revenue data based on selected period
  const revenueData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = startOfMonth(now);
    }

    const filteredOrders = orders.filter(order => {
      const orderDate = parseISO(order.createdAt);
      return orderDate >= startDate && order.status === 'Completed';
    });

    // Group by date
    const groupedData: { [key: string]: { revenue: number; orders: number } } = {};
    
    filteredOrders.forEach(order => {
      const date = format(parseISO(order.createdAt), 'MMM dd');
      const meal = typeof order.mealId === 'object' ? order.mealId : meals.find(m => m._id === order.mealId);
      const revenue = order.totalPrice || (meal?.price || 0) * (order.quantity || 1);
      
      if (!groupedData[date]) {
        groupedData[date] = { revenue: 0, orders: 0 };
      }
      groupedData[date].revenue += revenue;
      groupedData[date].orders += 1;
    });

    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }));
  }, [orders, meals, selectedPeriod]);

  // Calculate meal-wise revenue
  const mealRevenueData = useMemo((): MealRevenueData[] => {
    const completedOrders = orders.filter(order => order.status === 'Completed');
    const mealData: { [key: string]: { revenue: number; orders: number; mealName: string } } = {};

    completedOrders.forEach(order => {
      const meal = typeof order.mealId === 'object' ? order.mealId : meals.find(m => m._id === order.mealId);
      if (!meal) return;

      const mealId = typeof order.mealId === 'string' ? order.mealId : order.mealId._id || '';
      const revenue = order.totalPrice || (meal.price || 0) * (order.quantity || 1);

      if (!mealData[mealId]) {
        mealData[mealId] = { revenue: 0, orders: 0, mealName: meal.name };
      }
      mealData[mealId].revenue += revenue;
      mealData[mealId].orders += 1;
    });

    return Object.values(mealData).map(data => ({
      mealName: data.mealName,
      revenue: data.revenue,
      orders: data.orders,
      avgPrice: data.orders > 0 ? data.revenue / data.orders : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [orders, meals]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const completedOrders = orders.filter(order => order.status === 'Completed');
    const totalRevenue = completedOrders.reduce((sum, order) => {
      const meal = typeof order.mealId === 'object' ? order.mealId : meals.find(m => m._id === order.mealId);
      return sum + (order.totalPrice || (meal?.price || 0) * (order.quantity || 1));
    }, 0);

    const ordersWithRating = completedOrders.filter(order => order.rating && order.rating > 0);
    const avgRating = ordersWithRating.length > 0
      ? ordersWithRating.reduce((sum, order) => sum + (order.rating || 0), 0) / ordersWithRating.length
      : 0;

    return {
      totalRevenue,
      totalOrders: completedOrders.length,
      avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      avgRating: avgRating.toFixed(1),
      pendingOrders: orders.filter(order => order.status === 'Placed').length
    };
  }, [orders, meals]);

  // Generate PDF Report (using print dialog)
  const generatePDFReport = () => {
    window.print();
  };

  // Send Email Report
  const sendEmailReport = () => {
    const subject = encodeURIComponent(`Revenue Report - ${format(new Date(), 'MMM dd, yyyy')}`);
    const body = encodeURIComponent(`
Hi,

Here's your revenue analytics summary:

Total Revenue: ₹${stats.totalRevenue.toFixed(2)}
Total Orders: ${stats.totalOrders}
Average Order Value: ₹${stats.avgOrderValue.toFixed(2)}
Average Rating: ${stats.avgRating} / 5.0

Top Performing Meals:
${mealRevenueData.slice(0, 5).map((meal, i) => `${i + 1}. ${meal.mealName} - ₹${meal.revenue.toFixed(2)} (${meal.orders} orders)`).join('\n')}

Best regards,
HomeBite Analytics
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Revenue Analytics</h1>
            <p className="text-muted-foreground">Track your performance and earnings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={sendEmailReport}>
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>
            <Button onClick={generatePDFReport}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {stats.totalOrders} completed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.avgOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per completed order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 5.0 stars
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
          >
            Last Week
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
          >
            This Month
          </Button>
          <Button
            variant={selectedPeriod === '3months' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('3months')}
          >
            Last 3 Months
          </Button>
          <Button
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('year')}
          >
            This Year
          </Button>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
            <TabsTrigger value="meals">By Meal</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Daily revenue for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      name="Revenue (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Meal</CardTitle>
                  <CardDescription>Top performing dishes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mealRevenueData.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mealName" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#f97316" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Percentage share by meal</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mealRevenueData.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ mealName, percent }) => `${mealName} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {mealRevenueData.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Meal Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Meal Performance</CardTitle>
                <CardDescription>All meals sorted by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Meal Name</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Orders</th>
                        <th className="text-right p-2">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealRevenueData.map((meal, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{meal.mealName}</td>
                          <td className="text-right p-2">₹{meal.revenue.toFixed(2)}</td>
                          <td className="text-right p-2">{meal.orders}</td>
                          <td className="text-right p-2">₹{meal.avgPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
                <CardDescription>Number of orders per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookAnalytics;

import { useQuery } from '@tanstack/react-query';
import { Users, Clock, DollarSign, CheckCircle, TrendingUp, ShoppingBag } from 'lucide-react';
import { fetchDashboardMetrics } from '../api/api';

const Dashboard = () => {
  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center h-64">
        <p className="font-bold text-lg mb-2">Failed to load data</p>
        <p>{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here's what's happening in the hotel right now.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <MetricCard 
          title="Active Guests" 
          value={metrics.activeGuests.toString()} 
          icon={<Users size={24} className="text-blue-500" />} 
          trend="+5 today" 
          bgColor="bg-blue-50"
        />
        <MetricCard 
          title="Pending Orders" 
          value={metrics.pendingOrders.toString()} 
          icon={<Clock size={24} className="text-orange-500" />} 
          trend={metrics.pendingOrders > 10 ? 'High volume' : 'Normal volume'} 
          bgColor="bg-orange-50"
        />
        <MetricCard 
          title="Completed Orders" 
          value={metrics.completedOrders.toString()} 
          icon={<CheckCircle size={24} className="text-green-500" />} 
          bgColor="bg-green-50"
        />
        <MetricCard 
          title="Revenue Today" 
          value={`$${metrics.revenue}`} 
          icon={<DollarSign size={24} className="text-emerald-500" />} 
          bgColor="bg-emerald-50"
        />
        <MetricCard 
          title="Average Order Value" 
          value={`$${metrics.avgOrderValue}`} 
          icon={<TrendingUp size={24} className="text-purple-500" />} 
          bgColor="bg-purple-50"
        />
        <MetricCard 
          title="Top Service" 
          value={metrics.topService} 
          icon={<ShoppingBag size={24} className="text-pink-500" />} 
          bgColor="bg-pink-50"
        />
      </div>
      
      {/* Additional Visuals area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {metrics.recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium text-slate-900">{order.guestName} - Room {order.roomNumber}</p>
                <p className="text-sm text-slate-500">Requested {order.service}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold
                ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-orange-100 text-orange-700'}`}>
                {order.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, trend, bgColor }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow group">
    <div>
      <p className="text-slate-500 font-medium text-sm">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      {trend && <p className="text-xs font-medium text-slate-400 mt-2">{trend}</p>}
    </div>
    <div className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;

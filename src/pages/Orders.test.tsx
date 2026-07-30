import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchOrders, updateOrderStatus, cancelOrder, fetchOrderDetails } from '../api/api';
import type { Order, OrderStatus, ServiceType, OrderSummary } from '../types';
import { Search, AlertCircle, X, Check, Play, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

const Orders = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch paginated list
  const { data: paginatedData, isLoading, isError } = useQuery({
    queryKey: ['orders', { page, limit, search, statusFilter, serviceFilter, sortOrder }],
    queryFn: () => fetchOrders({ page, limit, search, statusFilter, serviceFilter, sortOrder }),
    placeholderData: keepPreviousData,
  });

  const mutationUpdate = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', selectedOrderId] });
    },
  });

  const mutationCancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrderId(null);
    }
  });

  const isSlaBreached = (order: OrderSummary) => {
    if (order.status !== 'New') return false;
    const mins = differenceInMinutes(new Date(), new Date(order.orderTime));
    return mins > 15;
  };

  const handleAction = (order: OrderSummary | Order, newStatus: OrderStatus) => {
    mutationUpdate.mutate({ id: order.id, status: newStatus });
  };

  // Reset page to 1 when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as any);
    setPage(1);
  };
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setServiceFilter(e.target.value as any);
    setPage(1);
  };
  const toggleSort = () => {
    setSortOrder(s => s === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  if (isLoading && !paginatedData) {
    return <div className="p-8 text-center text-slate-500">Loading orders...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error loading orders.</div>;
  }

  const orders = paginatedData?.data || [];
  const totalPages = paginatedData?.totalPages || 1;

  return (
    <div className="space-y-6 h-full flex flex-col fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-500 mt-1">Manage and track guest requests.</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search guest, ID, room..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={serviceFilter}
            onChange={handleServiceChange}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="All">All Services</option>
            <option value="Room Service">Room Service</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Laundry">Laundry</option>
            <option value="Extra Bed">Extra Bed</option>
            <option value="Spa & Massage">Spa & Massage</option>
          </select>

          <button
            onClick={toggleSort}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown size={16} />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm sticky top-0 z-2">
                <th className="p-4">Order ID</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Room</th>
                <th className="p-4">Service</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const breached = isSlaBreached(order);
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${breached ? 'bg-red-50/50' : ''}`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {order.id}
                        {breached && <span className="ml-2 inline-flex items-center text-xs font-bold text-red-600 animate-pulse"><AlertCircle size={12} className="mr-1" /> SLA</span>}
                      </td>
                      <td className="p-4">{order.guestName}</td>
                      <td className="p-4 font-bold">{order.roomNumber}</td>
                      <td className="p-4">{order.service}</td>
                      <td className="p-4 text-sm text-slate-500">
                        {format(new Date(order.orderTime), 'HH:mm')}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                        <QuickActions order={order} onAction={handleAction} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {orders.length} orders (Total: {paginatedData?.total || 0})
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium px-4 py-2 bg-white border border-slate-200 rounded-lg">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Drawer */}
      {selectedOrderId && (
        <OrderDetailsDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onAction={handleAction}
          onCancel={(id) => {
            if (confirm('Are you sure you want to cancel this order?')) {
              mutationCancel.mutate(id);
            }
          }}
        />
      )}
    </div>
  );
};

// Lazy Loaded Drawer Component
const OrderDetailsDrawer = ({ orderId, onClose, onAction, onCancel }: { orderId: string, onClose: () => void, onAction: (o: Order, s: OrderStatus) => void, onCancel: (id: string) => void }) => {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetails(orderId),
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex justify-end z-50 fade-in" onClick={onClose}>
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col slide-in-right" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Order Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p>Fetching full details...</p>
            </div>
          ) : isError || !order ? (
            <div className="text-red-500 text-center mt-10">Failed to load order details.</div>
          ) : (
            <>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 text-sm">Status</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Payment</span>
                  <span className={`font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Guest Name</p>
                  <p className="font-semibold">{order.guestName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Room</p>
                  <p className="font-bold text-primary">{order.roomNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Service</p>
                  <p className="font-medium">{order.service}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p className="font-medium">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="font-medium">${order.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Order Time</p>
                  <p className="font-medium">{format(new Date(order.orderTime), 'MMM d, HH:mm')}</p>
                </div>
              </div>

              {order.specialRequest ? (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Special Request</p>
                  <p className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                    "{order.specialRequest}"
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Special Request</p>
                  <p className="p-3 bg-slate-50 text-slate-500 rounded-lg text-sm italic border border-slate-100">
                    No special request provided.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {order && (
          <div className="pt-6 border-t border-slate-200 mt-auto">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Actions</p>
            <div className="flex flex-col gap-2">
              {order.status === 'New' && (
                <button onClick={() => onAction(order, 'Acknowledged')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
                  Acknowledge Order
                </button>
              )}
              {order.status === 'Acknowledged' && (
                <button onClick={() => onAction(order, 'In Progress')} className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition">
                  Start Processing
                </button>
              )}
              {order.status === 'In Progress' && (
                <button onClick={() => onAction(order, 'Completed')} className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition">
                  Mark as Completed
                </button>
              )}
              {['New', 'Acknowledged', 'In Progress'].includes(order.status) && (
                <button onClick={() => onCancel(order.id)} className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const colors = {
    'New': 'bg-blue-100 text-blue-700 border-blue-200',
    'Acknowledged': 'bg-purple-100 text-purple-700 border-purple-200',
    'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Cancelled': 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
      {status}
    </span>
  );
};

const QuickActions = ({ order, onAction }: { order: OrderSummary, onAction: (o: OrderSummary, s: OrderStatus) => void }) => {
  if (order.status === 'New') {
    return <button onClick={() => onAction(order, 'Acknowledged')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Acknowledge"><Check size={18} /></button>;
  }
  if (order.status === 'Acknowledged') {
    return <button onClick={() => onAction(order, 'In Progress')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Start"><Play size={18} /></button>;
  }
  if (order.status === 'In Progress') {
    return <button onClick={() => onAction(order, 'Completed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Complete"><Check size={18} /></button>;
  }
  return null;
};

export default Orders;

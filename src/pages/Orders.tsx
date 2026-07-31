import { useState, useEffect } from 'react';
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

  // Lock background scroll when drawer is open
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;
    if (selectedOrderId) {
      mainEl.classList.remove('overflow-auto');
      mainEl.classList.add('overflow-hidden');
    } else {
      mainEl.classList.remove('overflow-hidden');
      mainEl.classList.add('overflow-auto');
    }
    return () => {
      mainEl.classList.remove('overflow-hidden');
      mainEl.classList.add('overflow-auto');
    };
  }, [selectedOrderId]);

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
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading orders...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500 dark:text-red-400">Error loading orders.</div>;
  }

  const orders = paginatedData?.data || [];
  const totalPages = paginatedData?.totalPages || 1;

  return (
    <div className="h-full flex flex-col fade-in">

      {/* Orders List */}
      <div className='w-full h-full'>
        <div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Order Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track guest requests.</p>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-8 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search guest, ID, room..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full transition-colors duration-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none transition-colors duration-200"
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
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none transition-colors duration-200"
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
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <ArrowUpDown size={16} />
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
        <div className="max-h-127.5 lg:max-h-fit 2xl:max-h-245 flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium text-sm sticky top-0 z-2">
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
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => {
                    const breached = isSlaBreached(order);
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer ${breached ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td className="p-2 lg:p-4 font-medium text-slate-900 dark:text-slate-100">
                          {order.id}
                          {breached && <span className="lg:ml-2 inline-flex items-center text-xs font-bold text-red-600 dark:text-red-400 animate-pulse"><AlertCircle size={12} className="mr-1" /> SLA</span>}
                        </td>
                        <td className="p-2 lg:p-4 text-slate-700 dark:text-slate-300">{order.guestName}</td>
                        <td className="p-2 lg:p-4 font-bold text-slate-900 dark:text-slate-100">{order.roomNumber}</td>
                        <td className="p-2 lg:p-4 text-slate-700 dark:text-slate-300">{order.service}</td>
                        <td className="p-2 lg:p-4 text-sm text-slate-500 dark:text-slate-400">
                          {format(new Date(order.orderTime), 'HH:mm')}
                        </td>
                        <td className="p-2 lg:p-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-2 lg:p-4 text-right" onClick={e => e.stopPropagation()}>
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between transition-colors duration-200">
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
              Showing {orders.length} orders (Total: {paginatedData?.total || 0})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-medium px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight size={18} />
              </button>
            </div>
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
  const [isClosing, setIsClosing] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderDetails(orderId),
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-slate-900/50 flex justify-end z-50 ${isClosing ? 'fade-out' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl p-6 flex flex-col ${isClosing ? 'slide-out-right' : 'slide-in-right'} transition-colors duration-200`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Order Details</h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p>Fetching full details...</p>
            </div>
          ) : isError || !order ? (
            <div className="text-red-500 dark:text-red-400 text-center mt-10">Failed to load order details.</div>
          ) : (
            <>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Status</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 text-sm">Payment</span>
                  <span className={`font-medium ${order.paymentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Guest Name</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{order.guestName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Room</p>
                  <p className="font-bold text-primary dark:text-blue-400">{order.roomNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Service</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{order.service}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quantity</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Amount</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">${order.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Order Time</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{format(new Date(order.orderTime), 'MMM d, HH:mm')}</p>
                </div>
              </div>

              {order.specialRequest ? (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Special Request</p>
                  <p className="p-3 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm border border-yellow-100 dark:border-yellow-900/50">
                    "{order.specialRequest}"
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Special Request</p>
                  <p className="p-3 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-lg text-sm italic border border-slate-100 dark:border-slate-700">
                    No special request provided.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {order && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider font-semibold">Actions</p>
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
                <button onClick={() => onCancel(order.id)} className="w-full py-3 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition">
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
    'New': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    'Acknowledged': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
    'In Progress': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    'Completed': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    'Cancelled': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
      {status}
    </span>
  );
};

const QuickActions = ({ order, onAction }: { order: OrderSummary, onAction: (o: OrderSummary, s: OrderStatus) => void }) => {
  if (order.status === 'New') {
    return <button onClick={() => onAction(order, 'Acknowledged')} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg" title="Acknowledge"><Check size={18} /></button>;
  }
  if (order.status === 'Acknowledged') {
    return <button onClick={() => onAction(order, 'In Progress')} className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-lg" title="Start"><Play size={18} /></button>;
  }
  if (order.status === 'In Progress') {
    return <button onClick={() => onAction(order, 'Completed')} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg" title="Complete"><Check size={18} /></button>;
  }
  return null;
};

export default Orders;

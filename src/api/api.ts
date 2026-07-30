import type { Order, OrderStatus, ServiceType, OrderSummary, PaginatedResponse, DashboardMetrics } from '../types';
import { initialOrders } from './mockData';
import { subMinutes } from 'date-fns';

// Store in memory to simulate database state during the session
let ordersDB = [...initialOrders];

// Ensure one order is always > 15 mins old for SLA highlight demonstration
const slaOrderIndex = ordersDB.findIndex(o => o.status === 'New');
if (slaOrderIndex !== -1) {
  ordersDB[slaOrderIndex].orderTime = subMinutes(new Date(), 20).toISOString();
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface FetchOrdersParams {
  page: number;
  limit: number;
  search?: string;
  statusFilter?: OrderStatus | 'All';
  serviceFilter?: ServiceType | 'All';
  sortOrder?: 'desc' | 'asc';
}

export const fetchOrders = async (params: FetchOrdersParams): Promise<PaginatedResponse<OrderSummary>> => {
  await delay(800); // Simulate network latency

  const { page, limit, search = '', statusFilter = 'All', serviceFilter = 'All', sortOrder = 'desc' } = params;

  // Filter
  let filtered = ordersDB.filter(o => 
    (statusFilter === 'All' || o.status === statusFilter) &&
    (serviceFilter === 'All' || o.service === serviceFilter) &&
    (
      o.guestName.toLowerCase().includes(search.toLowerCase()) || 
      o.id.toLowerCase().includes(search.toLowerCase()) || 
      o.roomNumber.includes(search)
    )
  );

  // Sort
  filtered = filtered.sort((a, b) => {
    const timeA = new Date(a.orderTime).getTime();
    const timeB = new Date(b.orderTime).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  // Map to summary (exclude specialRequest)
  const data: OrderSummary[] = paginatedData.map(({ specialRequest, ...rest }) => rest);

  return {
    data,
    total,
    page,
    limit,
    totalPages
  };
};

export const fetchOrderDetails = async (id: string): Promise<Order> => {
  await delay(1500); // Simulate longer loading so the lazy-load spinner is very obvious
  
  const order = ordersDB.find(o => o.id === id);
  if (!order) throw new Error('Order not found');
  
  return { ...order }; // return full order including specialRequest
};

export const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  await delay(500);

  const pendingOrders = ordersDB.filter(o => ['New', 'Acknowledged', 'In Progress'].includes(o.status)).length;
  const completedOrdersList = ordersDB.filter(o => o.status === 'Completed');
  const completedOrders = completedOrdersList.length;
  const revenue = completedOrdersList.reduce((sum, o) => sum + o.amount, 0);
  const avgOrderValue = completedOrders > 0 ? (revenue / completedOrders).toFixed(2) : '0.00';
  
  const serviceCounts: Record<string, number> = {};
  ordersDB.forEach(o => {
    serviceCounts[o.service] = (serviceCounts[o.service] || 0) + o.quantity;
  });
  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Active guests could just be a random mock number based on orders
  const activeGuests = Math.floor(100 + ordersDB.length * 0.3);

  // Recent orders summary
  const recentOrders = ordersDB
    .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime())
    .slice(0, 4)
    .map(({ specialRequest, ...rest }) => rest);

  return {
    activeGuests,
    pendingOrders,
    completedOrders,
    revenue,
    avgOrderValue,
    topService,
    recentOrders
  };
};

export const updateOrderStatus = async ({ id, status }: { id: string, status: OrderStatus }): Promise<Order> => {
  await delay(600);
  
  const orderIndex = ordersDB.findIndex(o => o.id === id);
  if (orderIndex === -1) throw new Error('Order not found');

  const updatedOrder = { ...ordersDB[orderIndex], status };
  ordersDB[orderIndex] = updatedOrder;

  return updatedOrder;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  return updateOrderStatus({ id, status: 'Cancelled' });
};

export const simulateNewOrder = (): Order => {
  const services: ServiceType[] = ['Room Service', 'Housekeeping', 'Laundry', 'Extra Bed', 'Spa & Massage'];
  const randomService = services[Math.floor(Math.random() * services.length)];
  const newOrder: Order = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    guestName: 'Simulated Guest ' + Math.floor(1 + Math.random() * 99),
    roomNumber: `${Math.floor(100 + Math.random() * 900)}`,
    service: randomService,
    quantity: 1,
    amount: Math.floor(Math.random() * 100),
    orderTime: new Date().toISOString(),
    status: 'New',
    paymentStatus: 'Pending'
  };
  ordersDB = [newOrder, ...ordersDB];
  return newOrder;
};

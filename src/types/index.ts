export type OrderStatus = 'New' | 'Acknowledged' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';
export type ServiceType = 'Room Service' | 'Housekeeping' | 'Laundry' | 'Extra Bed' | 'Spa & Massage';

export interface Order {
  id: string;
  guestName: string;
  roomNumber: string;
  service: ServiceType;
  quantity: number;
  amount: number;
  specialRequest?: string;
  orderTime: string; // ISO 8601
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

// Summary type for list view (excludes heavy fields)
export type OrderSummary = Omit<Order, 'specialRequest'>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardMetrics {
  activeGuests: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
  avgOrderValue: string;
  topService: string;
  recentOrders: OrderSummary[];
}

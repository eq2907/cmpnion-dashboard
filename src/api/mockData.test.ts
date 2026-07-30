import type { Order, ServiceType, OrderStatus, PaymentStatus } from '../types';

const generateMockOrders = (count: number): Order[] => {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Emily', 'Robert', 'Olivia'];
  const lastNames = ['Smith', 'Johnson', 'Tan', 'Wilson', 'Lee', 'Davis', 'Brown', 'Taylor', 'Miller', 'Anderson'];
  const services: ServiceType[] = ['Room Service', 'Housekeeping', 'Laundry', 'Extra Bed', 'Spa & Massage'];
  const statuses: OrderStatus[] = ['New', 'Acknowledged', 'In Progress', 'Completed', 'Cancelled'];
  const payments: PaymentStatus[] = ['Paid', 'Pending', 'Failed'];

  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const id = `ORD-${1000 + i}`;
    const guestName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const roomNumber = `${Math.floor(100 + Math.random() * 800)}`;
    const service = services[Math.floor(Math.random() * services.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    let paymentStatus = payments[Math.floor(Math.random() * payments.length)];
    // Ensure completed orders are mostly paid
    if (status === 'Completed' && Math.random() > 0.1) paymentStatus = 'Paid';
    if (status === 'New') paymentStatus = 'Pending';

    // Spread the dates over the last 2 days
    const orderTime = new Date(Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000)).toISOString();

    orders.push({
      id,
      guestName,
      roomNumber,
      service,
      quantity: Math.floor(1 + Math.random() * 3),
      amount: Math.floor(10 + Math.random() * 150),
      specialRequest: Math.random() > 0.5 ? 'Special request for this order. Needs extra attention.' : undefined,
      orderTime,
      status,
      paymentStatus
    });
  }

  // Sort them so newer orders are first initially
  return orders.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
};

// Generate 150 mock orders
export const initialOrders: Order[] = generateMockOrders(150);

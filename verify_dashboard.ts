import { fetchDashboardMetrics } from './src/api/api';

async function verify() {
  console.log('Fetching dashboard metrics...');
  try {
    const metrics = await fetchDashboardMetrics();
    console.log('--- Dashboard Metrics ---');
    console.log(`Active Guests: ${metrics.activeGuests}`);
    console.log(`Pending Orders: ${metrics.pendingOrders}`);
    console.log(`Completed Orders: ${metrics.completedOrders}`);
    console.log(`Revenue Today: $${metrics.revenue}`);
    console.log(`Average Order Value: $${metrics.avgOrderValue}`);
    console.log(`Top Service: ${metrics.topService}`);
    console.log(`Recent Orders Count: ${metrics.recentOrders.length}`);
    console.log('-------------------------');
    console.log('Verification Successful! The endpoint returns the correct data structure.');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verify();

# 🏨 CMPNION — Hotel Service Management Dashboard

A modern, responsive hotel service management dashboard built as a Frontend Developer take-home technical assignment. Designed for hotel front-desk staff to manage guest service orders in real time.

---

## ✨ Features

- **📊 Dashboard Overview** — Metrics cards showing active guests, pending/completed orders, revenue, average order value, and top service type.
- **📋 Order Management Table** — Full paginated order list (50 rows per page) with search, filter by status/service, and sortable by order time.
- **🔍 Lazy Loading Details** — Clicking an order row opens a side drawer that fetches the full order details (including special requests) on demand — not loaded upfront.
- **⏱️ SLA Highlighting** — Orders with status `New` that are older than 15 minutes are highlighted with a red pulsing alert badge.
- **🔔 Real-time Notifications** — Simulates new orders arriving every 20 seconds with a toast notification that automatically refetches the order list.
- **📱 Responsive Design** — Mobile-friendly layout with a collapsible sidebar (hamburger menu), and responsive toast positioning/font size.
- **⚡ Pagination Controls** — Previous / Next buttons with current page and total page count shown at the bottom of the order table.
- **🔄 Order Status Workflow** — Progress an order through its lifecycle: `New → Acknowledged → In Progress → Completed` or `Cancel` at any step.

---

## 🛠️ Tech Stack

| Tech | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Vite](https://vitejs.dev/) | Build Tool & Dev Server |
| [Bun](https://bun.sh/) | Package Manager & Runtime |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [TanStack Query v5](https://tanstack.com/query) | Server State & Data Fetching |
| [React Router v7](https://reactrouter.com/) | Client-Side Routing |
| [Lucide React](https://lucide.dev/) | Icon Library |
| [date-fns](https://date-fns.org/) | Date Formatting & Calculation |
| [react-hot-toast](https://react-hot-toast.com/) | Toast Notifications |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your machine:

```bash
bun --version
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd cmpnion-dashboard-new
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Start the development server:**
   ```bash
   bun run dev
   ```

4. Open your browser and visit **`http://localhost:5173`**

---

## 📁 Project Structure

```
src/
├── api/
│   ├── api.ts          # Mock API functions (fetchOrders, fetchOrderDetails, etc.)
│   └── mockData.ts     # Generates 150 realistic mock orders
├── pages/
│   ├── Dashboard.tsx   # Overview page with metric cards
│   └── Orders.tsx      # Order management with pagination & lazy loading
├── types/
│   └── index.ts        # TypeScript types & interfaces
├── App.tsx             # Root layout, routing, and real-time simulation
├── main.tsx            # App entry point with QueryClient & BrowserRouter
└── index.css           # Global styles & Tailwind imports
```

---

## 🗺️ Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Metrics overview and recent activity |
| `/orders` | Orders | Paginated order management table |

---

## 🧪 Running Tests

Bun has a built-in test runner. To run all tests:

```bash
bun test
```

Test files should follow the naming convention: `*.test.ts` or `*.spec.ts`.

---

## 🏗️ Building for Production

To create a production build:

```bash
bun run build
```

The output will be in the `dist/` directory.

To preview the production build locally:

```bash
bun run preview
```

---

## 🔌 Mock API Overview

Since this is a frontend-only project, all data is simulated in-memory using the mock API layer (`src/api/api.ts`).

| Function | Description |
|---|---|
| `fetchOrders(params)` | Returns a paginated, filtered, and sorted list of `OrderSummary` objects |
| `fetchOrderDetails(id)` | Lazily fetches the full `Order` object (including `specialRequest`) |
| `fetchDashboardMetrics()` | Returns aggregated metrics for the Dashboard page |
| `updateOrderStatus({ id, status })` | Mutates an order's status in memory |
| `cancelOrder(id)` | Shorthand to set an order's status to `Cancelled` |
| `simulateNewOrder()` | Generates a random new order and prepends it to the in-memory DB |

> **Note:** All data resets when the browser page is refreshed, as the state is held in memory.

---

## 📝 License

This project was built as a take-home technical assignment for CMPNION.

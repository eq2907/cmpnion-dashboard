import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Menu, UserCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { simulateNewOrder } from './api/api';

function App() {
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Simulate a new order arriving every 20 seconds
    const interval = setInterval(() => {
      const newOrder = simulateNewOrder();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`New order received: ${newOrder.service} for Room ${newOrder.roomNumber}`, {
        duration: 5000,
        position: window.innerWidth < 768 ? 'top-center' : 'top-right',
        iconTheme: {
          primary: '#3b82f6',
          secondary: '#fff',
        },
        style: {
          fontSize: window.innerWidth < 768 ? '13px' : '16px',
        }
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Toaster />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-primary text-white flex flex-col shadow-xl fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="bg-white text-primary p-1 rounded-md text-sm font-black">CP</span>
            CMPNION
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <LayoutDashboard size={20} />
            Overview
          </NavLink>
          <NavLink
            to="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <ClipboardList size={20} />
            Orders
          </NavLink>
        </nav>
        <div className="p-4 border-t border-white/10 text-sm text-slate-400 flex items-center gap-3">
          <UserCircle size={32} />
          <div>
            <p className="font-medium text-white">Staff Member</p>
            <p className="text-xs">Front Desk</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="md:hidden font-bold text-primary">CMPNION</div>
          <div className="hidden md:block text-slate-500 font-medium">Hotel Service Management</div>
          <div className="md:hidden items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="relative text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full pl-4 lg:pl-5 pr-4 mt-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

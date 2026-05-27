import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import POS from './pages/POS';
import Staff from './pages/Staff';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Memberships from './pages/Memberships';
import Integrations from './pages/Integrations';
import Portal from './pages/Portal';

const Toaster = () => {
  const { toasts, removeToast } = useApp();
  const navigate = useNavigate();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => {
            if (toast.actionPath) {
              navigate(toast.actionPath);
            }
            removeToast(toast.id);
          }}
          className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl shadow-xl border cursor-pointer transform transition-all duration-300 translate-y-0 scale-100 hover:scale-[1.02] active:scale-95 animate-slide-in-right ${
            toast.type === 'whatsapp'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : toast.type === 'warning'
              ? 'bg-amber-500 border-amber-450 text-slate-900'
              : 'bg-indigo-650 border-indigo-600 text-white'
          }`}
        >
          <div className="flex-1 text-left">
            <p className="text-[10px] font-black tracking-wider uppercase opacity-90">
              {toast.type === 'whatsapp' ? '💬 WhatsApp Booking' : toast.type === 'warning' ? '⚠️ Stock Alert' : '🔔 Notification'}
            </p>
            <p className="text-xs font-bold leading-normal mt-1">{toast.message}</p>
            {toast.actionPath && (
              <span className="text-[9px] font-black underline block mt-2 opacity-95">
                Click to view and confirm booking →
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="text-white hover:text-slate-200 text-xs font-extrabold focus:outline-none px-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isPortal = location.pathname === '/portal';

  // Map route paths to exact page titles for the Navbar
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': 
        return 'Dashboard Analytics';
      case '/appointments': 
        return 'Appointments Book';
      case '/pos': 
        return 'Point of Sale (POS)';
      case '/staff': 
        return 'Staff Stylists';
      case '/inventory': 
        return 'Stock Inventory';
      case '/customers': 
        return 'Customer Database';
      case '/memberships': 
        return 'Membership Plans';
      case '/integrations': 
        return 'Integrations & API Channels';
      case '/portal':
        return 'Customer Portal';
      default: 
        return 'SalonSync';
    }
  };

  if (isPortal) {
    return (
      <div className="w-full min-h-screen bg-slate-900 overflow-y-auto">
        <Routes>
          <Route path="/portal" element={<Portal />} />
        </Routes>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Content (offset by sidebar width 240px) */}
      <div className="flex-1 flex flex-col pl-[240px] h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar pageTitle={getPageTitle(location.pathname)} />

        {/* Scrollable Page Layout container */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/integrations" element={<Integrations />} />
          </Routes>
        </main>
      </div>


      {/* Global Slide-in Toaster */}
      <Toaster />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;

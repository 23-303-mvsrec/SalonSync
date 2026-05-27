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
import { MessageSquare, PhoneCall, AlertTriangle, Bell } from 'lucide-react';

const InstagramIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Toaster = () => {
  const { toasts, removeToast } = useApp();
  const navigate = useNavigate();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 space-y-3.5 z-50 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let icon = <Bell className="h-4.5 w-4.5" />;
        let typeLabel = "Notification";
        let accentColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
        
        if (toast.type === 'whatsapp') {
          icon = <MessageSquare className="h-4.5 w-4.5" />;
          typeLabel = "WhatsApp Agent";
          accentColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        } else if (toast.type === 'instagram') {
          icon = <InstagramIcon />;
          typeLabel = "Instagram Agent";
          accentColor = "text-pink-400 bg-pink-500/10 border-pink-500/20";
        } else if (toast.type === 'voice') {
          icon = <PhoneCall className="h-4.5 w-4.5" />;
          typeLabel = "Voice Command";
          accentColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="h-4.5 w-4.5" />;
          typeLabel = "Stock Alert";
          accentColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
        }

        return (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.actionPath) {
                navigate(toast.actionPath);
              }
              removeToast(toast.id);
            }}
            className="pointer-events-auto flex items-start space-x-3.5 p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl cursor-pointer transition-all duration-200 hover:border-slate-700 hover:scale-[1.02] active:scale-98 animate-slide-in-right relative overflow-hidden group select-none"
          >
            {/* Left accent strip */}
            <div className={`absolute top-0 bottom-0 left-0 w-1 ${
              toast.type === 'whatsapp' ? 'bg-emerald-500' :
              toast.type === 'instagram' ? 'bg-pink-500' :
              toast.type === 'voice' ? 'bg-sky-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              'bg-indigo-500'
            }`} />

            {/* Icon Block */}
            <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${accentColor}`}>
              {icon}
            </div>

            {/* Content block */}
            <div className="flex-1 text-left min-w-0 pr-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{typeLabel}</span>
                <span className="text-[9px] font-bold text-slate-500">Just now</span>
              </div>
              <p className="text-xs font-bold text-slate-100 leading-snug mt-1.5">{toast.message}</p>
              {toast.actionPath && (
                <span className="text-[9.5px] font-black text-indigo-400 group-hover:text-indigo-350 transition-colors flex items-center space-x-1 mt-2.5">
                  <span>Open Routing Hub</span>
                  <span>→</span>
                </span>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xs font-bold focus:outline-none p-1 shrink-0"
            >
              ✕
            </button>
            
            {/* Auto-dismiss progress bar animation */}
            <div className="absolute bottom-0 left-1 right-0 h-[2px] bg-slate-800">
              <div 
                className={`h-full animate-toast-progress ${
                  toast.type === 'whatsapp' ? 'bg-emerald-500' :
                  toast.type === 'instagram' ? 'bg-pink-500' :
                  toast.type === 'voice' ? 'bg-sky-500' :
                  toast.type === 'warning' ? 'bg-amber-500' :
                  'bg-indigo-500'
                }`}
                style={{ animationDuration: '4000ms' }}
              />
            </div>
          </div>
        );
      })}
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

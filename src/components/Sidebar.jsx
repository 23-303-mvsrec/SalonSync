import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  ShoppingCart, 
  Users, 
  Package, 
  UserCheck,
  MessageSquare,
  Award,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'POS & Billing', path: '/pos', icon: ShoppingCart },
    { name: 'Staff', path: '/staff', icon: Users },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Customers', path: '/customers', icon: UserCheck },
    { name: 'Memberships', path: '/memberships', icon: Award },
    { name: 'Integrations & API', path: '/integrations', icon: MessageSquare },
    { name: 'Customer Website', path: '/portal', icon: Globe }
  ];


  return (
    <aside className="w-[240px] bg-[#1a1a2e] text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl text-white shadow-md shadow-purple-900/30">
            <Scissors className="h-6 w-6 transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide">SalonSync</h1>
            <p className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">Multi-Branch Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${isActive 
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
                }
              `}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Date Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-900/30 rounded-2xl p-4 text-center">
          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Active Session</p>
          <div className="text-white font-bold text-sm">26 May 2026</div>
          <p className="text-[9px] text-slate-500 mt-1">System Time Live</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

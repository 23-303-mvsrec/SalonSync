import React, { useState } from 'react';
import BranchSelector from './BranchSelector';
import DateSelector from './DateSelector';
import { Bell, Shield, LogOut, Settings, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ pageTitle }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { notificationsLog, markNotificationsAsRead } = useApp();
  const navigate = useNavigate();

  const unreadCount = notificationsLog.filter(n => n.unread).length;

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    setShowProfileDropdown(false);
    if (nextState) {
      markNotificationsAsRead();
    }
  };

  // Determine deep-link path from notification type/message
  const getNotifPath = (notif) => {
    const type = notif.type?.toLowerCase() || '';
    const msg = notif.message?.toLowerCase() || '';
    if (type === 'whatsapp' || type === 'instagram' || type === 'voice call') return '/integrations';
    if (msg.includes('stock') || msg.includes('inventory') || type === 'sms') return '/inventory';
    if (msg.includes('appointment') || msg.includes('checked in') || msg.includes('completed')) return '/appointments';
    return null;
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-8 relative z-10">
      {/* Left side: Page Title */}
      <h2 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight shrink-0 hidden md:block">{pageTitle}</h2>

      {/* Right side: Filters & Actions */}
      <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
        <div className="flex items-center space-x-2 md:space-x-3">
          <BranchSelector />
          <DateSelector />
        </div>
        
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        
        <div className="flex items-center space-x-4">
        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200 focus:outline-none relative"
          >
            <Bell className="h-5.5 w-5.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-85 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 shrink-0 animate-in fade-in slide-in-from-top-3 duration-250 z-20">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <span className="font-bold text-slate-800 text-xs">System & API Webhooks</span>
                {unreadCount > 0 ? (
                  <span className="text-[9px] bg-purple-100 text-purple-750 px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold uppercase">All Read</span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                {notificationsLog.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 italic text-xs font-semibold">
                    No notifications yet.
                  </div>
                ) : (
                  notificationsLog.map((notif) => {
                    const path = getNotifPath(notif);
                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          if (path) {
                            setShowNotifications(false);
                            navigate(path);
                          }
                        }}
                        className={`px-4 py-3 transition-colors duration-150 flex flex-col space-y-1 text-left ${
                          path ? 'cursor-pointer hover:bg-violet-50/40' : 'hover:bg-slate-50'
                        } ${notif.unread ? 'bg-purple-50/20' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            notif.type === 'WhatsApp' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                              : notif.type === 'Instagram'
                              ? 'bg-pink-50 text-pink-700 border border-pink-150'
                              : notif.type === 'Voice Call'
                              ? 'bg-sky-50 text-sky-700 border border-sky-150'
                              : 'bg-blue-50 text-blue-750 border border-blue-150'
                          }`}>
                            {notif.type}
                          </span>
                          <div className="flex items-center gap-2">
                            {path && (
                              <span className="text-[8px] text-violet-500 font-extrabold">→ View</span>
                            )}
                            <span className="text-[9px] text-slate-400 font-bold">{notif.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-650 font-bold leading-normal">{notif.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 focus:outline-none group"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center shadow-md ring-2 ring-purple-100 hover:ring-purple-300 transition-all duration-200">
              SA
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Salon Admin</p>
              <p className="text-[10px] text-slate-400 font-medium">Platform Manager</p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-slate-800">admin@salonsync.com</p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security & System</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Branch Config</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Subscription</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
};

export default Navbar;

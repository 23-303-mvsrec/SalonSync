import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Scissors,
  CheckCircle,
  AlertCircle,
  Globe,
  MessageCircle,
  Phone,
  IndianRupee,
  Check
} from 'lucide-react';

const Instagram = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const SESSION_DATE = '2026-05-26';

const Appointments = () => {
  const { 
    selectedBranchId, 
    appointments, 
    staff, 
    services, 
    customers, 
    addAppointment, 
    updateAppointmentStatus,
    addCustomer
  } = useApp();

  // Search & Filter State
  const [activePill, setActivePill] = useState('All'); // All | Confirmed | In Progress | Completed | Pending
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list | calendar

  // Live Holiday API States
  const [holidays, setHolidays] = useState([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      try {
        const res = await fetch('https://date.nager.at/api/v3/PublicHolidays/2026/IN');
        if (res.ok) {
          const data = await res.json();
          setHolidays(data);
        }
      } catch (e) {
        console.error("Error fetching live holidays:", e);
      } finally {
        setIsLoadingHolidays(false);
      }
    };
    fetchHolidays();
  }, []);

  const todayHoliday = holidays.find(h => h.date === SESSION_DATE);

  // Form States
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    serviceId: '',
    staffId: '',
    date: SESSION_DATE,
    time: '09:00',
    source: 'Walk-in'
  });

  // Filter staff by selected branch
  const activeBranchStaff = staff.filter(s => s.branchId === selectedBranchId);

  // Filter appointments by selected branch
  const branchAppts = appointments.filter(a => a.branchId === selectedBranchId);

  // Stats Row calculations for selected branch today
  const todayBranchAppts = branchAppts.filter(a => a.date === SESSION_DATE);
  const totalToday = todayBranchAppts.length;
  const confirmedToday = todayBranchAppts.filter(a => a.status === 'confirmed').length;
  const inProgressToday = todayBranchAppts.filter(a => a.status === 'inprogress').length;
  const completedToday = todayBranchAppts.filter(a => a.status === 'completed').length;

  // Filter by pill selection
  const filteredAppts = branchAppts.filter(appt => {
    if (activePill === 'All') return true;
    if (activePill === 'In Progress') return appt.status === 'inprogress';
    return appt.status === activePill.toLowerCase();
  });

  // Submit appointment booking
  const handleBookAppointment = (e) => {
    e.preventDefault();
    const { customerName, phoneNumber, serviceId, staffId, date, time, source } = formData;

    if (!customerName || !phoneNumber || !serviceId || !staffId || !date || !time) {
      alert('Please fill out all required fields');
      return;
    }

    // 1. Customer Check (match by phone)
    let customerId;
    let finalCustomerName = customerName.trim();
    const cleanPhone = phoneNumber.trim();

    const existingCust = customers.find(c => c.phone === cleanPhone);
    if (existingCust) {
      customerId = existingCust.id;
      finalCustomerName = existingCust.name; // Keep standard name
    } else {
      // Add customer if doesn't exist
      const newCust = addCustomer({
        name: finalCustomerName,
        phone: cleanPhone,
        preferredBranch: selectedBranchId,
        loyaltyPoints: 0,
        totalVisits: 0
      });
      customerId = newCust.id;
    }

    // 2. Lookup Service & Staff
    const selectedService = services.find(s => s.id === parseInt(serviceId, 10));
    const selectedStaff = staff.find(s => s.id === parseInt(staffId, 10));

    if (!selectedService || !selectedStaff) {
      alert('Invalid service or stylist selection');
      return;
    }

    // 3. Save Appointment
    addAppointment({
      customerId,
      customerName: finalCustomerName,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      branchId: selectedBranchId,
      date,
      time,
      status: 'pending',
      source: source.toLowerCase(),
      amount: selectedService.price
    });

    // Reset Form & Close Modal
    setFormData({
      customerName: '',
      phoneNumber: '',
      serviceId: '',
      staffId: '',
      date: SESSION_DATE,
      time: '09:00',
      source: 'Walk-in'
    });
    setIsModalOpen(false);
  };

  // Helper to generate initials
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Helper to get initials color classes
  const getAvatarStyle = (name) => {
    const hash = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const colors = [
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-rose-100 text-rose-700 border-rose-200',
    ];
    return colors[hash % colors.length];
  };

  // Source badges
  const getSourceBadge = (source) => {
    const normalized = (source || '').toLowerCase();
    switch (normalized) {
      case 'website':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-150">
            <Globe className="h-3.5 w-3.5" /> Website
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-150">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-150">
            <Instagram className="h-3.5 w-3.5" /> Instagram
          </span>
        );
      case 'call':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-150">
            <Phone className="h-3.5 w-3.5" /> Call
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            <User className="h-3.5 w-3.5" /> Walk-in
          </span>
        );
    }
  };

  // Time Slots (30 min increments, 09:00 to 20:00)
  const timeSlots = [];
  for (let h = 9; h <= 20; h++) {
    const hourStr = h.toString().padStart(2, '0');
    timeSlots.push(`${hourStr}:00`);
    if (h < 20) {
      timeSlots.push(`${hourStr}:30`);
    }
  }

  const pills = ['All', 'Confirmed', 'In Progress', 'Completed', 'Pending'];

  // Calendar Placement Helpers
  const parseTimeToOffset = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const [h, m] = parts.map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    const totalMinutes = (h - 9) * 60 + m;
    // 1 hour = 100px, 1 min = 1.667px
    return totalMinutes * (100 / 60);
  };

  const durationToHeight = (durationMins) => {
    return durationMins * (100 / 60);
  };

  const handleGridSlotClick = (stylistId, timeStr) => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      serviceId: '',
      staffId: stylistId.toString(),
      date: SESSION_DATE,
      time: timeStr,
      source: 'Walk-in'
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto select-none">
      
      {/* SECTION 1 — Top Bar & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-500">Manage bookings, check-in customers, and monitor branch capacity.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/10 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* View Switcher and Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5">
          {pills.map((pill) => {
            const isActive = activePill === pill;
            return (
              <button
                key={pill}
                onClick={() => setActivePill(pill)}
                className={`px-4.5 py-2.5 rounded-full text-xs font-extrabold tracking-wide uppercase border transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/15'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4.5 py-2 rounded-lg text-xs font-extrabold transition-all duration-150 ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Card List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4.5 py-2 rounded-lg text-xs font-extrabold transition-all duration-150 ${viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Calendar Scheduler
          </button>
        </div>
      </div>

      {todayHoliday && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-800 flex items-center space-x-3 text-left animate-slide-in">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-extrabold text-amber-900">Live API Holiday Notice: {todayHoliday.name}</p>
            <p className="text-[10px] text-amber-700 font-medium">Today is a recognized public holiday in India ({todayHoliday.localName}). Stylist availability and branch schedules may be adjusted.</p>
          </div>
        </div>
      )}

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1 p-2 border-r border-slate-100 last:border-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Today</p>
          <p className="text-2xl font-extrabold text-slate-800">{totalToday}</p>
        </div>
        <div className="space-y-1 p-2 border-r border-slate-100 last:border-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-extrabold text-blue-600">{confirmedToday}</p>
        </div>
        <div className="space-y-1 p-2 border-r border-slate-100 last:border-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-extrabold text-purple-600">{inProgressToday}</p>
        </div>
        <div className="space-y-1 p-2 last:border-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-600">{completedToday}</p>
        </div>
      </div>

      {/* SECTION 2 — Views (List / Calendar Grid) */}
      {viewMode === 'list' ? (
        filteredAppts.length === 0 ? (
          <div className="bg-white py-16 px-6 text-center rounded-3xl border border-slate-100 shadow-sm space-y-4 max-w-xl mx-auto animate-slide-in">
            <div className="flex justify-center">
              <span className="text-4xl block">📅</span>
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">No Appointments Found</h4>
            <p className="text-xs text-slate-450 max-w-sm mx-auto">
              There are no appointments registered in this category for the active branch. Create a new appointment booking to populate lists.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 hover:scale-105 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm shrink-0 inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Book Appointment</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppts.map((appt) => {
              const service = services.find(s => s.id === appt.serviceId);
              const duration = service ? service.duration : 30;

              return (
                <div 
                  key={appt.id} 
                  className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-200 transition-all duration-200 space-y-5 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-850 text-base">{appt.customerName}</h4>
                    <div className="shrink-0">{getSourceBadge(appt.source)}</div>
                  </div>

                  <div>
                    <span className="text-purple-600 font-extrabold text-sm uppercase tracking-wide">
                      {appt.serviceName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${getAvatarStyle(appt.staffName)}`}>
                      {getInitials(appt.staffName)}
                    </div>
                    <span className="text-xs text-slate-655 font-bold">{appt.staffName}</span>
                  </div>

                  <div className="flex items-center space-x-6 text-xs text-slate-500 border-t border-slate-50 pt-3">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{appt.time}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Scissors className="h-4 w-4 text-slate-400" />
                      <span>{duration} min</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-emerald-600 font-bold text-base">
                    <IndianRupee className="h-4.5 w-4.5" />
                    <span>{appt.amount}</span>
                  </div>

                  <div className="border-t border-slate-100/80 pt-4 flex items-center justify-between gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                      appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                      appt.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border-indigo-250' :
                      appt.status === 'inprogress' ? 'bg-purple-50 text-purple-700 border-purple-250' :
                      appt.status === 'pending' ? 'bg-yellow-50 text-yellow-750 border-yellow-250' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {appt.status === 'inprogress' ? 'In Progress' : appt.status}
                    </span>

                    <div className="flex-1 flex justify-end">
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, 'inprogress')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Check In
                        </button>
                      )}

                      {appt.status === 'inprogress' && (
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm flex items-center space-x-1.5"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          <span>Complete</span>
                        </button>
                      )}

                      {appt.status === 'pending' && (
                        <button
                          onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Confirm
                        </button>
                      )}

                      {appt.status === 'completed' && (
                        <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Calendar Scheduler View */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Calendar Header with Column Titles */}
          <div className="flex bg-slate-50 border-b border-slate-200 divide-x divide-slate-200">
            {/* Time labels spacing column */}
            <div className="w-20 p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
              Time
            </div>
            {/* Stylist Columns Headers */}
            {activeBranchStaff.map(stylist => (
              <div key={stylist.id} className="flex-1 p-4 text-center select-none">
                <p className="font-extrabold text-slate-800 text-xs">{stylist.name}</p>
                <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wider mt-0.5">{stylist.role}</p>
              </div>
            ))}
            {activeBranchStaff.length === 0 && (
              <div className="flex-1 p-4 text-center text-xs text-slate-400 italic">
                No staff members registered in this branch. Go to the Staff tab to add stylists!
              </div>
            )}
          </div>

          {/* Calendar Grid Area */}
          <div className="flex relative overflow-y-auto max-h-[700px] divide-x divide-slate-100" style={{ height: '650px' }}>
            
            {/* Time Column Y-Axis */}
            <div className="w-20 bg-slate-50/50 flex flex-col select-none relative shrink-0" style={{ height: '1200px' }}>
              {Array.from({ length: 12 }).map((_, idx) => {
                const hour = 9 + idx;
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                return (
                  <div 
                    key={idx} 
                    className="absolute left-0 right-0 border-b border-slate-100 text-center font-mono text-[10px] text-slate-400 font-bold"
                    style={{ top: `${idx * 100}px`, height: '100px', pt: '10px' }}
                  >
                    {timeStr}
                  </div>
                );
              })}
            </div>

            {/* Stylists Columns Grid */}
            <div className="flex-1 flex relative" style={{ height: '1200px' }}>
              {/* Background Hourly Grid Lines (across all columns) */}
              <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-0">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="absolute left-0 right-0 border-b border-slate-150" 
                    style={{ top: `${idx * 100}px`, height: '100px' }}
                  />
                ))}
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="absolute left-0 right-0 border-b border-dashed border-slate-100" 
                    style={{ top: `${idx * 100 + 50}px`, height: '50px' }}
                  />
                ))}
              </div>

              {/* Stylist Columns */}
              {activeBranchStaff.map(stylist => {
                // Find appointments for this stylist today
                const stylistAppts = filteredAppts.filter(a => a.staffId === stylist.id && a.date === SESSION_DATE);

                return (
                  <div key={stylist.id} className="flex-1 relative border-r border-slate-100 last:border-r-0 h-full group z-10">
                    {/* Clickable background slots for scheduling */}
                    {Array.from({ length: 24 }).map((_, slotIdx) => {
                      const hour = Math.floor(slotIdx / 2) + 9;
                      const mins = slotIdx % 2 === 0 ? '00' : '30';
                      const timeStr = `${hour.toString().padStart(2, '0')}:${mins}`;
                      return (
                        <button
                          key={slotIdx}
                          onClick={() => handleGridSlotClick(stylist.id, timeStr)}
                          className="absolute left-0 right-0 hover:bg-purple-50/20 transition-all opacity-0 hover:opacity-100 border-b border-transparent flex items-center justify-center text-[10px] font-bold text-purple-650 select-none z-0 cursor-pointer"
                          style={{ top: `${slotIdx * 50}px`, height: '50px' }}
                          title={`Book appointment at ${timeStr}`}
                        >
                          + Book ({timeStr})
                        </button>
                      );
                    })}

                    {/* Plotted Appointments Cards */}
                    {stylistAppts.map(appt => {
                      const service = services.find(s => s.id === appt.serviceId);
                      const duration = service ? service.duration : 30;
                      const topOffset = parseTimeToOffset(appt.time);
                      const height = durationToHeight(duration);

                      const statusColor = 
                        appt.status === 'completed' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' :
                        appt.status === 'confirmed' ? 'border-indigo-500 bg-indigo-50 text-indigo-850' :
                        appt.status === 'inprogress' ? 'border-purple-500 bg-purple-50 text-purple-850' :
                        appt.status === 'pending' ? 'border-amber-400 bg-amber-50/70 text-amber-900' :
                        'border-slate-400 bg-slate-50 text-slate-800';

                      return (
                        <div
                          key={appt.id}
                          className={`absolute left-1.5 right-1.5 rounded-xl border-l-4 p-2.5 shadow-sm flex flex-col justify-between overflow-hidden text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] z-10 ${statusColor}`}
                          style={{ top: `${topOffset + 2}px`, height: `${height - 4}px` }}
                        >
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-start gap-1">
                              <p className="font-extrabold text-[10px] truncate leading-none">{appt.customerName}</p>
                              <span className="text-[7px] font-black uppercase tracking-wider shrink-0">{appt.source}</span>
                            </div>
                            <p className="font-semibold text-[8px] uppercase tracking-wide truncate mt-0.5">{appt.serviceName}</p>
                          </div>

                          <div className="flex justify-between items-end border-t border-slate-200/40 pt-1 mt-1 text-[8px] font-bold">
                            <span>{appt.time} ({duration}m)</span>
                            <span className="font-extrabold text-[9px]">₹{appt.amount}</span>
                          </div>

                          {/* Quick Actions Panel if height is big enough */}
                          {height >= 80 && (
                            <div className="flex gap-1.5 pt-1 mt-1 border-t border-slate-200/30 justify-end shrink-0 select-none">
                              {appt.status === 'confirmed' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(appt.id, 'inprogress'); }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded text-[8px] font-bold shadow-sm cursor-pointer"
                                >
                                  In
                                </button>
                              )}
                              {appt.status === 'inprogress' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(appt.id, 'completed'); }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-[8px] font-bold shadow-sm cursor-pointer"
                                >
                                  Done
                                </button>
                              )}
                              {appt.status === 'pending' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(appt.id, 'confirmed'); }}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-0.5 rounded text-[8px] font-bold shadow-sm cursor-pointer"
                                >
                                  Confirm
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3 — New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-slate-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-800">New Appointment</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-650 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.customerName}
                  onChange={(e) => setFormData(p => ({ ...p, customerName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                />
              </div>

              {/* Service Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service *</label>
                <select
                  required
                  value={formData.serviceId}
                  onChange={(e) => setFormData(p => ({ ...p, serviceId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                >
                  <option value="">-- Select Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ₹{s.price} ({s.duration} min)</option>
                  ))}
                </select>
              </div>

              {/* Stylist Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stylist (Staff) *</label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData(p => ({ ...p, staffId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                >
                  <option value="">-- Select Stylist --</option>
                  {activeBranchStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              {/* Date & Time (30-min slots) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time *</label>
                  <select
                    required
                    value={formData.time}
                    onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Booking Source */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Source *</label>
                <select
                  required
                  value={formData.source}
                  onChange={(e) => setFormData(p => ({ ...p, source: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                >
                  <option value="Website">Website</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Call">Call</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-150 hover:bg-slate-200 text-slate-650 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/10 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
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
  Check,
  Zap
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

const Appointments = () => {
  const { 
    selectedBranchId, 
    appointments, 
    staff, 
    services, 
    customers, 
    addAppointment, 
    updateAppointmentStatus,
    addCustomer,
    currentDate,
    setPendingPOSPrefill
  } = useApp();
  
  // Get URL params for pre-fill
  const searchParams = new URLSearchParams(window.location.search);
  const prefilStaffId = searchParams.get('staffId');
  const prefilCustId = searchParams.get('custId');

  // Local UI filter when arriving with staffId param
  const [staffFilterId, setStaffFilterId] = useState(null);

  const navigate = useNavigate();

  // Search & Filter State
  const [activePill, setActivePill] = useState('All'); // All | Confirmed | In Progress | Completed | Pending
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list | calendar

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', resolve: null });

  const showConfirm = (message) => new Promise((resolve) => {
    setConfirmModal({ open: true, message, resolve });
  });

  const handleConfirmOk = () => {
    confirmModal.resolve(true);
    setConfirmModal({ open: false, message: '', resolve: null });
  };

  const handleConfirmCancel = () => {
    confirmModal.resolve(false);
    setConfirmModal({ open: false, message: '', resolve: null });
  };

  // Live Holiday API States
  const [holidays, setHolidays] = useState([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      try {
        const res = await fetch('https://date.nager.at/api/v3/PublicHolidays/2026/IN');
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            try {
              const data = JSON.parse(text);
              setHolidays(data);
            } catch (jsonErr) {
              console.warn("Failed to parse holidays JSON:", jsonErr);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load live holiday database:", e.message);
      } finally {
        setIsLoadingHolidays(false);
      }
    };
    fetchHolidays();
  }, []);

  const todayHoliday = holidays.find(h => h.date === currentDate);

  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const [h, m] = parts.map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  const getApptDuration = (serviceId) => {
    const s = services.find(srv => srv.id === parseInt(serviceId, 10));
    return s ? s.duration : 30;
  };

  const isTimeOverlap = (time1, duration1, time2, duration2) => {
    const t1Start = timeToMinutes(time1);
    const t1End = t1Start + duration1;
    const t2Start = timeToMinutes(time2);
    const t2End = t2Start + duration2;
    return t1Start < t2End && t2Start < t1End;
  };

  const hasConflict = (apptId, staffId, date, time, serviceId) => {
    if (!staffId || !date || !time) return false;

    // Retrieve service ID from the existing appointment if not explicitly passed
    let finalServiceId = serviceId;
    if (!finalServiceId && apptId) {
      const appt = appointments.find(a => a.id === apptId);
      if (appt) finalServiceId = appt.serviceId;
    }

    const duration = finalServiceId ? getApptDuration(finalServiceId) : 30;

    return appointments.some(a => 
      a.id !== apptId &&
      a.staffId === parseInt(staffId, 10) &&
      a.date === date &&
      a.status !== 'cancelled' &&
      isTimeOverlap(a.time, getApptDuration(a.serviceId), time, duration)
    );
  };

  // Form States
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    serviceId: '',
    staffId: '',
    date: currentDate,
    time: '09:00',
    source: 'Walk-in'
  });

  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Filter staff by selected branch
  const activeBranchStaff = staff.filter(s => s.branchId === selectedBranchId);

  // Filter appointments by selected branch
  const branchAppts = appointments.filter(a => a.branchId === selectedBranchId);

  // Stats Row calculations for selected branch today
  const todayBranchAppts = branchAppts.filter(a => a.date === currentDate);
  const totalToday = todayBranchAppts.length;
  const confirmedToday = todayBranchAppts.filter(a => a.status === 'confirmed').length;
  const inProgressToday = todayBranchAppts.filter(a => a.status === 'inprogress').length;
  const completedToday = todayBranchAppts.filter(a => a.status === 'completed' || a.status === 'billed').length;

  // Past-date read-only mode
  const realToday = new Date().toISOString().slice(0, 10);
  const isPastDate = currentDate < realToday;

  // Filter by pill selection AND by selected date AND optional staff filter
  const filteredAppts = branchAppts.filter(appt => {
    if (appt.date !== currentDate) return false;
    if (staffFilterId && parseInt(staffFilterId, 10) !== appt.staffId) return false;
    if (activePill === 'All') return true;
    if (activePill === 'In Progress') return appt.status === 'inprogress';
    if (activePill === 'Completed') return appt.status === 'completed' || appt.status === 'billed';
    return appt.status === activePill.toLowerCase();
  });
  
  // Pre-fill form if coming from Customer card
  useEffect(() => {
    if (prefilCustId) {
      const cust = customers.find(c => c.id === parseInt(prefilCustId, 10));
      if (cust) {
        setFormData(prev => ({
          ...prev,
          customerName: cust.name,
          phoneNumber: cust.phone
        }));
        setSelectedCustomer(cust);
        setShowCustomerDropdown(false);
        setIsModalOpen(true);
      }
    }
  }, [prefilCustId]);

  // Apply staff filter if present in URL
  useEffect(() => {
    if (prefilStaffId) {
      setStaffFilterId(parseInt(prefilStaffId, 10));
      // Switch to list view so filter is visible
      setViewMode('list');
    }
  }, [prefilStaffId]);

  // Bill Now — navigate to POS with this appointment pre-filled
  const handleBillNow = (appt) => {
    const customer = customers.find(c => c.id === appt.customerId);
    setPendingPOSPrefill({
      appointmentId: appt.id,
      customerName: appt.customerName,
      phone: customer?.phone || '',
      customerId: appt.customerId,
      serviceId: appt.serviceId,
      serviceName: appt.serviceName,
      staffId: appt.staffId,
      staffName: appt.staffName,
    });
    navigate('/pos');
  };

  // Submit appointment booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const { customerName, phoneNumber, serviceId, staffId, date, time, source } = formData;

    if (!customerName || !phoneNumber || !serviceId || !staffId || !date || !time) {
      alert('Please fill out all required fields');
      return;
    }

    // 1. Customer Check (match selected customer, or register on-the-fly)
    let finalCustomer = selectedCustomer;
    if (!finalCustomer) {
      const trimmedPhone = phoneNumber.trim();
      const existingCust = customers.find(c => c.phone.trim() === trimmedPhone);
      if (existingCust) {
        finalCustomer = existingCust;
      } else {
        try {
          finalCustomer = await addCustomer({
            name: customerName,
            phone: trimmedPhone,
            preferredBranch: selectedBranchId
          });
        } catch (err) {
          alert('Failed to register customer: ' + err.message);
          return;
        }
      }
    }

    const customerId = finalCustomer.id;
    const finalCustomerName = finalCustomer.name;

    // 2. Lookup Service & Staff
    const selectedService = services.find(s => s.id === parseInt(serviceId, 10));
    let selectedStaff;
    if (staffId === 'any') {
      const freeStylist = activeBranchStaff.find(s => 
        !hasConflict(null, s.id, date, time, serviceId)
      );
      if (freeStylist) {
        selectedStaff = freeStylist;
      } else {
        if (activeBranchStaff.length === 0) {
          alert('No stylists are registered in this branch.');
          return;
        }
        const confirmBooking = await showConfirm(
          `All stylists in this branch have a scheduling conflict at this time. Do you want to proceed and assign to the first stylist (${activeBranchStaff[0].name}) anyway?`
        );
        if (!confirmBooking) return;
        selectedStaff = activeBranchStaff[0];
      }
    } else {
      selectedStaff = staff.find(s => s.id === parseInt(staffId, 10));
    }

    if (!selectedService || !selectedStaff) {
      alert('Invalid service or stylist selection');
      return;
    }

    // Check if slot is already booked (duration-aware overlap check)
    const isSlotBooked = hasConflict(null, selectedStaff.id, date, time, serviceId);

    if (isSlotBooked) {
      const confirmBooking = await showConfirm(
        `Stylist ${selectedStaff.name} has a scheduling conflict/overlap at this time (${time}) on this date (${date}). Do you still want to confirm this as a double-booking?`
      );
      if (!confirmBooking) {
        return;
      }
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
      date: currentDate,
      time: '09:00',
      source: 'Walk-in'
    });
    setSelectedCustomer(null);
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
      date: currentDate,
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
        {isPastDate ? (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold select-none self-start md:self-auto">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Past Date — View Only</span>
          </div>
        ) : (
          <button
            onClick={() => {
              setFormData({
                customerName: '',
                phoneNumber: '',
                serviceId: '',
                staffId: '',
                date: currentDate,
                time: '09:00',
                source: 'Walk-in'
              });
              setSelectedCustomer(null);
              setIsModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/10 flex items-center space-x-2 self-start md:self-auto"
          >
            <Plus className="h-5 w-5" />
            <span>New Appointment</span>
          </button>
        )}
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
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide uppercase border transition-all duration-200 ${
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

        {/* If a staff filter is applied via URL, show a clearable pill */}
        {staffFilterId && (
          <div className="ml-2 flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-extrabold flex items-center gap-2">
              <span>Showing schedule for</span>
              <strong className="uppercase">{(staff.find(s => s.id === parseInt(staffFilterId, 10))||{}).name || `Staff ${staffFilterId}`}</strong>
            </div>
            <button
              onClick={() => setStaffFilterId(null)}
              className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs"
            >
              Clear
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Stylist Filter Select Dropdown */}
          <select
            value={staffFilterId || ''}
            onChange={(e) => setStaffFilterId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all cursor-pointer shadow-sm"
          >
            <option value="">All Stylists</option>
            {activeBranchStaff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-5 py-2 rounded-lg text-xs font-extrabold transition-all duration-150 ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Card List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-5 py-2 rounded-lg text-xs font-extrabold transition-all duration-150 ${viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Calendar Scheduler
            </button>
          </div>
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
                    <div className="space-y-1 text-left">
                      <h4 className="font-bold text-slate-850 text-base">{appt.customerName}</h4>
                      {hasConflict(appt.id, appt.staffId, appt.date, appt.time) && (
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-150 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider animate-pulse">
                            <AlertCircle className="h-3 w-3 text-rose-500 animate-pulse" /> Overlap Conflict
                          </span>
                        </div>
                      )}
                    </div>
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
                      appt.status === 'completed' || appt.status === 'billed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                      appt.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border-indigo-250' :
                      appt.status === 'inprogress' ? 'bg-purple-50 text-purple-700 border-purple-250' :
                      appt.status === 'pending' ? 'bg-yellow-50 text-yellow-755 border-yellow-250' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {appt.status === 'inprogress' ? 'In Progress' : appt.status === 'billed' ? 'Billed' : appt.status}
                    </span>

                    <div className="flex-1 flex justify-end">
                      {isPastDate ? (
                        <span className="text-[9px] text-slate-350 font-semibold italic">Archive</span>
                      ) : (
                        <>
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
                            <button
                              onClick={() => handleBillNow(appt)}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm hover:shadow-md"
                            >
                              <Zap className="h-3 w-3" />
                              Bill Now
                            </button>
                          )}
                        </>
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
            {activeBranchStaff
              .filter(s => !staffFilterId || s.id === parseInt(staffFilterId, 10))
              .map(stylist => (
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
              {activeBranchStaff
                .filter(s => !staffFilterId || s.id === parseInt(staffFilterId, 10))
                .map(stylist => {
                // Find appointments for this stylist today
                const stylistAppts = filteredAppts.filter(a => a.staffId === stylist.id && a.date === currentDate);

                return (
                  <div key={stylist.id} className="flex-1 relative border-r border-slate-100 last:border-r-0 h-full group z-10">
                    {/* Clickable background slots for scheduling (today only) */}
                    {!isPastDate && Array.from({ length: 24 }).map((_, slotIdx) => {
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
                      const isConflicted = hasConflict(appt.id, appt.staffId, appt.date, appt.time);

                      const statusColor = 
                        isConflicted ? 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/20' :
                        appt.status === 'completed' || appt.status === 'billed' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' :
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
                              <p className="font-extrabold text-[10px] truncate leading-none flex items-center gap-1">
                                {isConflicted && <AlertCircle className="h-3 w-3 text-rose-600 animate-pulse shrink-0" />}
                                <span>{appt.customerName}</span>
                              </p>
                              <span className="text-[7px] font-black uppercase tracking-wider shrink-0">{appt.source}</span>
                            </div>
                            <p className="font-semibold text-[8px] uppercase tracking-wide truncate mt-0.5">{appt.serviceName}</p>
                          </div>

                          <div className="flex justify-between items-end border-t border-slate-200/40 pt-1 mt-1 text-[8px] font-bold">
                            <span>{appt.time} ({duration}m)</span>
                            <span className="font-extrabold text-[9px]">₹{appt.amount}</span>
                          </div>

                          {/* Quick Actions Panel if height is big enough */}
                          {height >= 80 && !isPastDate && (
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
              <div className="space-y-1.5 relative text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Search existing customer by name or phone..."
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, customerName: e.target.value }));
                      setSelectedCustomer(null); // Clear selected customer if they edit the name
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowCustomerDropdown(false);
                      }, 250);
                    }}
                    className={`w-full bg-slate-50 border ${
                      selectedCustomer ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200'
                    } rounded-xl pl-3.5 pr-20 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300`}
                  />
                  {selectedCustomer ? (
                    <div className="absolute right-3 flex items-center space-x-1.5">
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">
                        Selected
                      </span>
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                  ) : (
                    <div className="absolute right-3 flex items-center">
                      <Search className="h-4 w-4 text-slate-400 shrink-0" />
                    </div>
                  )}
                </div>

                {/* Customer Dropdown Results */}
                {showCustomerDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto">
                    {(() => {
                      const val = formData.customerName.toLowerCase().trim();
                      const matchedCustomers = val 
                        ? customers.filter(c => c.name.toLowerCase().includes(val) || c.phone.includes(val))
                        : customers.slice(0, 15); // Show first 15 customers when input is empty

                      if (matchedCustomers.length === 0) {
                        return (
                          <div className="p-3 text-center text-xs text-rose-500 font-bold">
                            No matching customers found.
                          </div>
                        );
                      }

                      return (
                        <div>
                          {!val && (
                            <div className="bg-slate-50 px-3 py-1.5 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 sticky top-0 text-left">
                              Existing Customers ({customers.length} total)
                            </div>
                          )}
                          {matchedCustomers.map(cust => (
                            <div
                              key={cust.id}
                              onMouseDown={() => {
                                setFormData(p => ({ 
                                  ...p, 
                                  customerName: cust.name,
                                  phoneNumber: cust.phone
                                }));
                                setSelectedCustomer(cust);
                                setShowCustomerDropdown(false);
                              }}
                              className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-[10px]">
                                  {cust.name[0]}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold text-slate-800">{cust.name}</p>
                                  <p className="text-[10px] text-slate-450 font-semibold">{cust.phone}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-extrabold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-150">
                                {cust.loyaltyPoints} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
                {!selectedCustomer && formData.customerName.trim() && formData.phoneNumber.trim() && (
                  <p className="text-[10px] font-bold text-emerald-600 mt-1 text-left flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>New customer will be registered on-the-fly upon booking.</span>
                  </p>
                )}
                {!selectedCustomer && formData.customerName.trim() && !formData.phoneNumber.trim() && (
                  <p className="text-[10px] font-bold text-amber-600 mt-1 text-left flex items-center gap-1 animate-pulse">
                    <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                    <span>Please enter a phone number to register this customer.</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    required
                    readOnly={!!selectedCustomer}
                    placeholder="e.g. 9876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      if (!selectedCustomer) {
                        setFormData(p => ({ ...p, phoneNumber: e.target.value }));
                      }
                    }}
                    className={`w-full ${
                      selectedCustomer ? 'bg-slate-100/70 border-slate-200 text-slate-450 cursor-not-allowed select-none' : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300'
                    } border rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none`}
                  />
                  {selectedCustomer && (
                    <span className="absolute right-3 text-[9px] font-extrabold text-slate-400 uppercase bg-slate-200/50 px-1.5 py-0.5 rounded border border-slate-300/30">
                      Linked
                    </span>
                  )}
                </div>
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
                  <option value="any">Any Stylist (No Preference)</option>
                  {activeBranchStaff.map(s => {
                    const isBusy = formData.serviceId && formData.date && formData.time &&
                      hasConflict(null, s.id, formData.date, formData.time, formData.serviceId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role}){isBusy ? ' - [Busy/Conflict]' : ''}
                      </option>
                    );
                  })}
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
                    {timeSlots.map(slot => {
                      let isBusy = false;
                      if (formData.staffId && formData.staffId !== 'any' && formData.serviceId && formData.date) {
                        isBusy = hasConflict(null, formData.staffId, formData.date, slot, formData.serviceId);
                      } else if (formData.staffId === 'any' && formData.serviceId && formData.date) {
                        isBusy = activeBranchStaff.length > 0 && activeBranchStaff.every(s =>
                          hasConflict(null, s.id, formData.date, slot, formData.serviceId)
                        );
                      }
                      return (
                        <option key={slot} value={slot}>
                          {slot}{isBusy ? ' - [Busy/Conflict]' : ''}
                        </option>
                      );
                    })}
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

      {/* Custom Conflict Confirmation Modal */}
      {confirmModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 10, 30, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.18s ease',
          }}
          onClick={handleConfirmCancel}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #2d2060 100%)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              borderRadius: '20px',
              padding: '32px 28px 24px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15)',
              animation: 'slideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Warning Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(239,68,68,0.35)',
              }}>
                <AlertCircle size={22} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#f1f5f9', letterSpacing: '-0.01em' }}>Scheduling Conflict</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(148,163,184,0.8)', marginTop: '2px' }}>Double-booking warning</p>
              </div>
            </div>

            {/* Message */}
            <p style={{
              margin: '0 0 24px',
              fontSize: '13.5px',
              color: '#cbd5e1',
              lineHeight: '1.6',
              padding: '14px 16px',
              background: 'rgba(239,68,68,0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              {confirmModal.message}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f1f5f9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOk}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(239,68,68,0.4)',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(239,68,68,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)'; }}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;

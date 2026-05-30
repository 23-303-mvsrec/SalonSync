import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  Calendar, 
  IndianRupee, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Star, 
  MapPin,
  Clock,
  ArrowRight,
  TrendingDown,
  MessageSquare,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { 
    selectedBranchId, 
    setSelectedBranchId, 
    appointments, 
    inventory, 
    staff, 
    branches,
    customers,
    membershipPlans,
    waMessages,
    isLiveStreaming,
    currentDate
  } = useApp();

  const navigate = useNavigate();
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Filter lists by active branch
  const branchAppts = useMemo(() => appointments.filter(a => a.branchId === selectedBranchId), [appointments, selectedBranchId]);
  const branchStaff = useMemo(() => staff.filter(s => s.branchId === selectedBranchId), [staff, selectedBranchId]);
  const branchInventory = useMemo(() => inventory.filter(i => i.branchId === selectedBranchId), [inventory, selectedBranchId]);

  // Current Date: Tuesday, 26 May 2026
  const targetDate = currentDate;

  // --- KPI 1: Today's Appointments ---
  const todayAppts = useMemo(() => branchAppts.filter(a => a.date === targetDate), [branchAppts, targetDate]);
  const todayApptsCount = todayAppts.length;
  
  const completedApptsToday = todayAppts.filter(a => a.status === 'completed' || a.status === 'billed').length;
  const confirmedApptsToday = todayAppts.filter(a => a.status === 'confirmed' || a.status === 'inprogress').length;
  const apptRatio = todayApptsCount > 0 ? Math.round((completedApptsToday / todayApptsCount) * 100) : 0;

  // --- KPI 2: Today's Revenue ---
  const todayRevenue = useMemo(() => {
    return todayAppts
      .filter(a => a.status === 'completed' || a.status === 'billed')
      .reduce((sum, a) => sum + a.amount, 0);
  }, [todayAppts]);
  const revenueTarget = 15000;
  const targetPct = Math.round((todayRevenue / revenueTarget) * 100);

  // --- KPI 3: Active Staff Today ---
  const activeStaffCount = branchStaff.length;
  const busyStaffCount = useMemo(() => {
    const busyIds = new Set(
      todayAppts
        .filter(a => a.status === 'inprogress')
        .map(a => a.staffId)
    );
    return busyIds.size;
  }, [todayAppts]);
  const availStaffCount = Math.max(0, activeStaffCount - busyStaffCount);

  // --- KPI 4: Low Stock Alerts ---
  const lowStockItems = useMemo(() => branchInventory.filter(i => i.quantity < i.minStock), [branchInventory]);
  const lowStockCount = lowStockItems.length;
  const lowStockText = lowStockItems.slice(0, 2).map(item => item.name).join(', ') || 'No alerts';

  const vipCount = useMemo(() => {
    return customers.filter(c => c.membershipId && c.preferredBranch === selectedBranchId).length;
  }, [customers, selectedBranchId]);

  // --- KPI Number Counter Animations ---
  const [animatedAppts, setAnimatedAppts] = useState(0);
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedStaff, setAnimatedStaff] = useState(0);
  const [animatedLowStock, setAnimatedLowStock] = useState(0);

  useEffect(() => {
    // Reset counters
    setAnimatedAppts(0);
    setAnimatedRevenue(0);
    setAnimatedStaff(0);
    setAnimatedLowStock(0);

    const duration = 1000; // 1 second animation
    const steps = 25;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeProgress = progress * (2 - progress); // Ease out

      setAnimatedAppts(Math.round(easeProgress * todayApptsCount));
      setAnimatedRevenue(Math.round(easeProgress * todayRevenue));
      setAnimatedStaff(Math.round(easeProgress * activeStaffCount));
      setAnimatedLowStock(Math.round(easeProgress * lowStockCount));

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedAppts(todayApptsCount);
        setAnimatedRevenue(todayRevenue);
        setAnimatedStaff(activeStaffCount);
        setAnimatedLowStock(lowStockCount);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [selectedBranchId, todayApptsCount, todayRevenue, activeStaffCount, lowStockCount, animationTrigger]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAnimationTrigger(prev => prev + 1); // trigger animation counter again
    }, 1000);
  };

  // --- Recharts PieChart: Omnichannel Booking Sources ---
  const sourceColors = {
    website: '#6d28d9',
    whatsapp: '#16a34a',
    walkin: '#94a3b8',
    call: '#f59e0b',
    instagram: '#ec4899'
  };

  const pieData = useMemo(() => {
    const channels = ['website', 'whatsapp', 'walkin', 'call', 'instagram'];
    return channels.map(chan => {
      const count = todayAppts.filter(a => a.source === chan).length;
      return { 
        name: chan.charAt(0).toUpperCase() + chan.slice(1), 
        value: count, 
        rawName: chan 
      };
    });
  }, [todayAppts]);

  // --- Recharts AreaChart: Weekly Revenue Trend ---
  const weekData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const parts = targetDate.split('-');
    if (parts.length < 3) return [];
    const baseDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    
    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      
      const dayName = dayNames[d.getDay()];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      daysData.push({
        dayName,
        dateString,
      });
    }

    return daysData.map(({ dayName, dateString }) => {
      const dayRevenue = branchAppts
        .filter(a => a.date === dateString && (a.status === 'completed' || a.status === 'billed'))
        .reduce((sum, a) => sum + a.amount, 0);

      return {
        day: dayName,
        revenue: dayRevenue
      };
    });
  }, [branchAppts, targetDate]);

  // --- Live Table Feed ---
  // Sort today's appointments by time ascending
  const sortedTodayAppts = useMemo(() => {
    return [...todayAppts].sort((a, b) => a.time.localeCompare(b.time));
  }, [todayAppts]);

  const [highlightedRowId, setHighlightedRowId] = useState(null);

  // --- Branch Performance Comparison data ---
  const branchPerformance = useMemo(() => {
    return branches.map(br => {
      const brAppts = appointments.filter(a => a.branchId === br.id);
      const brTodayAppts = brAppts.filter(a => a.date === targetDate);
      const brRevenue = brTodayAppts
        .filter(a => a.status === 'completed' || a.status === 'billed')
        .reduce((sum, a) => sum + a.amount, 0);
      const brStaffCount = staff.filter(s => s.branchId === br.id).length;

      return {
        ...br,
        apptsCount: brTodayAppts.length,
        revenue: brRevenue,
        staffCount: brStaffCount
      };
    });
  }, [appointments, staff, branches, targetDate]);

  // Find max revenue among branches for relative progress bar scaling
  const maxBranchRevenue = useMemo(() => {
    const revs = branchPerformance.map(b => b.revenue);
    return Math.max(...revs, 1000);
  }, [branchPerformance]);

  const formatDateDisplay = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto select-none">
      
      {/* 1. WELCOME HERO BANNER */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 overflow-hidden shadow-lg shadow-purple-950/15">
        {/* Abstract shapes */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              Welcome back, Admin 👋
            </h1>
            <p className="text-violet-100 text-sm mt-1.5 font-medium">
              Here's what's happening at <span className="text-white font-bold underline decoration-violet-300 underline-offset-4">{activeBranch.name}</span> today
            </p>
          </div>
          
          <div className="flex items-center space-x-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-bold text-white tracking-wide">
              {formatDateDisplay(currentDate)}
            </div>
            
            <button
              onClick={handleRefresh}
              className="bg-white text-slate-800 hover:text-purple-700 font-bold px-4 py-2.5 rounded-2xl shadow-md transition-all duration-200 flex items-center space-x-2 text-xs"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS ROW (4 cards with entrance animations) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
        
        {/* Card 1: Today's Appointments */}
        <div
          onClick={() => navigate('/appointments')}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg hover:border-violet-200 transition-all duration-300 group relative overflow-hidden cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</p>
              <h3 className="text-3xl font-black text-slate-850">{animatedAppts}</h3>
            </div>
            <div className="bg-violet-50 text-violet-600 p-3 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-200 shadow-inner">
              <Calendar className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>Ratio (Completed vs Total)</span>
              <span className="text-violet-600">{apptRatio}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-violet-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${apptRatio}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-emerald-600 font-extrabold flex items-center space-x-1 pt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+3 vs yesterday</span>
            </p>
          </div>
        </div>

        {/* Card 2: Today's Revenue */}
        <div
          onClick={() => navigate('/pos')}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group relative overflow-hidden cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-3xl font-black text-slate-850">
                ₹{animatedRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
              <IndianRupee className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>Target: ₹15,000</span>
              <span className="text-emerald-600 font-extrabold">{targetPct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, targetPct)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold flex items-center space-x-1 pt-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>+18% vs last week</span>
            </p>
          </div>
        </div>

        {/* Card 3: Active Staff Today */}
        <div
          onClick={() => navigate('/staff')}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg hover:border-blue-200 transition-all duration-300 group relative overflow-hidden cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Staff Today</p>
              <h3 className="text-3xl font-black text-slate-850">{animatedStaff}</h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <Users className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500">
              <span className="text-emerald-600 font-bold">{availStaffCount} available</span>
              {' • '}
              <span className="text-slate-400 font-bold">{busyStaffCount} busy today</span>
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${activeStaffCount > 0 ? (availStaffCount / activeStaffCount) * 100 : 0}%` }}
              ></div>
              <div 
                className="bg-amber-400 h-full" 
                style={{ width: `${activeStaffCount > 0 ? (busyStaffCount / activeStaffCount) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium pt-1">Roster assignments synced live</p>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div
          onClick={() => navigate('/inventory?lowStock=1')}
          className={`bg-white p-6 rounded-3xl shadow-sm border flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative overflow-hidden cursor-pointer transform hover:-translate-y-1 ${
            lowStockCount > 0 ? 'border-rose-300 ring-2 ring-rose-100 ring-opacity-50 animate-pulse-slow' : 'border-slate-100'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className={`text-3xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-850'}`}>
                {animatedLowStock}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl group-hover:text-white transition-all duration-200 ${
              lowStockCount > 0 
                ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 animate-pulse' 
                : 'bg-slate-50 text-slate-400 group-hover:bg-slate-400'
            }`}>
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alert items:</p>
            {lowStockCount > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {lowStockItems.slice(0, 3).map(item => (
                  <button
                    key={item.id}
                    onClick={() => navigate('/inventory?lowStock=1')}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[9px] font-bold hover:bg-rose-200 hover:shadow-sm transition-all duration-200 group"
                    title={item.name}
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-500 group-hover:scale-125 transition-transform"></span>
                    <span className="truncate max-w-[80px]">{item.name}</span>
                  </button>
                ))}
                {lowStockCount > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold text-rose-600 bg-rose-50 rounded-lg">
                    +{lowStockCount - 3} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-500">No low stock items</p>
            )}
          </div>
        </div>

      </div>

      {/* 3. CHARTS SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* Left Card (40% width): Booking Sources PieChart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-4 flex flex-col justify-between space-y-6">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Today's Bookings by Channel</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Booking source distribution comparison</p>
          </div>

          {/* Pie Chart container */}
          <div className="h-[220px] flex items-center justify-center relative">
            {todayApptsCount === 0 ? (
              <div className="text-center text-slate-400 space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-350" />
                <p className="text-[10px] font-bold">No active bookings recorded today</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #f1f5f9' }} 
                  />
                  <Pie
                    data={pieData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sourceColors[entry.rawName]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center label */}
            {todayApptsCount > 0 && (
              <div className="absolute text-center">
                <p className="text-2xl font-black text-slate-800">{todayApptsCount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
              </div>
            )}
          </div>

          {/* Custom Counts Legend below chart */}
          <div className="grid grid-cols-5 gap-2 border-t border-slate-50 pt-4 text-center">
            {pieData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: sourceColors[item.rawName] }}></span>
                  <span className="text-[9px] text-slate-500 font-bold">{item.name}</span>
                </div>
                <p className="text-xs font-black text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card (60% width): Revenue Trend AreaChart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Revenue This Week</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Trailing 7-day revenue performance</p>
            </div>
            <div className="bg-violet-50 text-violet-700 px-3 py-1 rounded-xl text-[10px] font-extrabold flex items-center space-x-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Synced Live</span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weekData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purpleFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip 
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  fill="url(#purpleFill)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. TODAY'S LIVE FEED & INTEGRATION STATUS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* Left Side: Live Table Feed (6 columns) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Live Appointments Feed</h3>
            </div>
            <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 font-bold px-2.5 py-1 rounded-xl">
              {sortedTodayAppts.length} scheduled today
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                  <tr className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Stylist</th>
                    <th className="py-3 px-4 text-center">Source</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {sortedTodayAppts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 italic font-semibold">No appointments scheduled for today yet.</td>
                    </tr>
                  ) : (
                    sortedTodayAppts.map((appt) => {
                      const isSelected = highlightedRowId === appt.id;
                      return (
                        <tr 
                          key={appt.id} 
                          onClick={() => { setHighlightedRowId(isSelected ? null : appt.id); navigate('/appointments'); }}
                          className={`cursor-pointer transition-all duration-150 ${
                            isSelected ? 'bg-violet-50/80 text-violet-900' : 'hover:bg-slate-50/50 even:bg-slate-50/20'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold">
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className={isSelected ? 'text-violet-750 font-extrabold' : ''}>{appt.time}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{appt.customerName}</td>
                          <td className="py-3.5 px-4 text-slate-600">{appt.serviceName}</td>
                          <td className="py-3.5 px-4 text-slate-600">{appt.staffName}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              appt.source === 'website' ? 'bg-purple-100 text-purple-700' :
                              appt.source === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' :
                              appt.source === 'instagram' ? 'bg-pink-100 text-pink-700' :
                              appt.source === 'call' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {appt.source}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                              appt.status === 'completed' || appt.status === 'billed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              appt.status === 'confirmed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              appt.status === 'inprogress' ? 'bg-amber-55 text-amber-700 border border-amber-200' :
                              appt.status === 'pending' ? 'bg-slate-50 text-slate-600 border border-slate-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {appt.status === 'inprogress' ? 'In Progress' : appt.status === 'billed' ? 'Billed' : appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">₹{appt.amount}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link 
              to="/appointments" 
              className="text-xs font-bold text-violet-600 hover:text-violet-750 flex items-center space-x-1 group"
            >
              <span>View All Appointments</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Side: Channel Sync & VIP Memberships Health (4 columns) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6 lg:col-span-4 text-left">
          <div className="border-b border-slate-50 pb-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Channel Sync & VIP Memberships</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Live integration status & active campaigns</p>
            </div>
            <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
              Active
            </span>
          </div>

          {/* Sync Status items */}
          <div className="flex-1 space-y-4">
            
            {/* WhatsApp sync status */}
            <div className="flex items-start justify-between border-b border-slate-50 pb-3">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-50 text-emerald-650 p-2 rounded-xl shrink-0 border border-emerald-100">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">WhatsApp API Webhook</h4>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5 font-mono">/api/webhooks/whatsapp</p>
                  <div className="flex items-center space-x-1.5 mt-1 text-[9.5px]">
                    <span className="text-slate-400 font-semibold">Status:</span>
                    <span className={isLiveStreaming ? 'text-emerald-600 font-bold' : 'text-slate-500 font-bold'}>
                      {isLiveStreaming ? 'Streaming' : 'Paused'}
                    </span>
                    {waMessages.length > 0 && (
                      <>
                        <span className="text-slate-350">•</span>
                        <span className="text-purple-600 font-extrabold">{waMessages.filter(m => m.sender === 'client').length} msgs</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 pt-1">
                <span className="relative flex h-2 w-2">
                  {isLiveStreaming && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveStreaming ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                </span>
                <span className={`text-[9px] font-extrabold uppercase ${isLiveStreaming ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {isLiveStreaming ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Website booking widget status */}
            <div className="flex items-start justify-between border-b border-slate-50 pb-3">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-50 text-purple-650 p-2 rounded-xl shrink-0 border border-purple-100">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Website Embed Widget</h4>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Widget Script: v1.2.0-stable</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 pt-1 text-[9px] text-emerald-700 font-extrabold uppercase">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-650 shrink-0" />
                <span>Connected</span>
              </div>
            </div>

            {/* VIP loyalty memberships status */}
            <div className="flex items-start justify-between border-b border-slate-50 pb-3">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-50 text-amber-655 p-2 rounded-xl shrink-0 border border-amber-100">
                  <Star className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">VIP Club Enrollment</h4>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Active premium subscribers</p>
                </div>
              </div>
              <div className="pt-1 select-none">
                <span className="bg-amber-100 text-amber-850 font-extrabold px-2.5 py-0.5 rounded-full text-[9px] border border-amber-250">
                  {vipCount} Members
                </span>
              </div>
            </div>

            {/* Notifications dispatch service status */}
            <div className="flex items-start justify-between pb-1">
              <div className="flex items-start space-x-3">
                <div className="bg-slate-50 text-slate-600 p-2 rounded-xl shrink-0 border border-slate-200">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">SMS & Receipts Gateway</h4>
                  <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Automated notification center</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 pt-1 text-[9px] text-emerald-700 font-extrabold uppercase">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-650 shrink-0" />
                <span>Active</span>
              </div>
            </div>

          </div>

          {/* Quick link button to integrations page */}
          <Link 
            to="/integrations"
            className="w-full text-center bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold py-3 rounded-2xl text-xs transition-colors border border-purple-150 flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Manage Integrations & Webhooks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>

      {/* 5. BRANCH PERFORMANCE COMPARISON */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
        <div className="border-b border-slate-50 pb-3">
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">All Branches Today</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quick comparisons of today's achievements across branches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branchPerformance.map((bp) => {
            const isCurrent = bp.id === selectedBranchId;
            // Percent contribution for comparison bar
            const comparisonPct = Math.round((bp.revenue / maxBranchRevenue) * 100);

            return (
              <div
                key={bp.id}
                onClick={() => { setSelectedBranchId(bp.id); navigate('/appointments'); }}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-md ${
                  isCurrent 
                    ? 'border-violet-600 bg-violet-50/10 ring-2 ring-violet-500/10' 
                    : 'border-slate-150 bg-slate-50/20 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs truncate max-w-[170px]">{bp.name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{bp.city}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] bg-violet-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm shadow-violet-600/10">
                      Current
                    </span>
                  )}
                </div>

                {/* Performance stats summary */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-y border-slate-100 py-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Bookings</p>
                    <p className="font-extrabold text-slate-800">{bp.apptsCount}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Staff</p>
                    <p className="font-extrabold text-slate-800">{bp.staffCount}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sales Today</p>
                    <p className="font-extrabold text-purple-700">₹{bp.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Revenue Volume Share</span>
                    <span className={isCurrent ? 'text-violet-600' : ''}>{comparisonPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isCurrent ? 'bg-violet-600' : 'bg-slate-400'}`}
                      style={{ width: `${comparisonPct || 5}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

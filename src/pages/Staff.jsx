import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Plus, 
  IndianRupee, 
  Trophy, 
  Phone, 
  Percent, 
  Briefcase,
  X,
  Calendar,
  CheckCircle,
  TrendingUp,
  Search
} from 'lucide-react';

const Staff = () => {
  const { 
    selectedBranchId, 
    staff, 
    appointments, 
    addStaff 
  } = useApp();

  // Search filter for lists/table
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State for adding new staff
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Senior Stylist',
    phone: '',
    commissionPct: '20'
  });

  // Modal State for viewing staff details
  const [detailedStaff, setDetailedStaff] = useState(null);

  // Local state for Mark Paid toggle (dict of staffId -> boolean)
  const [paidStatus, setPaidStatus] = useState({});

  // Filter staff by selected branch
  const branchStaff = staff.filter(s => s.branchId === selectedBranchId);

  // Helper: Get commission & stats for a staff member for May 2026
  const getStaffStats = (member) => {
    // Filter completed appointments this month for this staff member
    const completedAppts = appointments.filter(appt => {
      const matchesStaff = appt.staffId === member.id;
      const matchesBranch = appt.branchId === selectedBranchId;
      const matchesStatus = appt.status === 'completed';
      const matchesMonth = appt.date && appt.date.startsWith('2026-05');
      return matchesStaff && matchesBranch && matchesStatus && matchesMonth;
    });

    const revenue = completedAppts.reduce((sum, appt) => sum + appt.amount, 0);
    const commission = Math.round(revenue * (member.commissionPct / 100));

    return {
      completedCount: completedAppts.length,
      revenue,
      commission,
      appointments: completedAppts
    };
  };

  // Pre-calculate stats for all branch staff
  const staffWithStats = branchStaff.map(member => {
    const stats = getStaffStats(member);
    return {
      ...member,
      ...stats
    };
  });

  // Filter staff based on search query
  const filteredStaffWithStats = staffWithStats.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SECTION 1 Calculations
  // Total Staff count
  const totalStaffCount = branchStaff.length;

  // Total Commission This Month
  const totalCommissionThisMonth = staffWithStats.reduce((sum, s) => sum + s.commission, 0);

  // Top Performer (highest revenue)
  let topPerformer = null;
  if (staffWithStats.length > 0) {
    // Sort to find the one with highest revenue
    const sortedByRevenue = [...staffWithStats].sort((a, b) => b.revenue - a.revenue);
    if (sortedByRevenue[0] && sortedByRevenue[0].revenue > 0) {
      topPerformer = sortedByRevenue[0];
    }
  }

  // Branch Total Revenue (for progress bar comparison)
  const branchTotalRevenue = staffWithStats.reduce((sum, s) => sum + s.revenue, 0);

  // Submit new staff member
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in Name and Phone number.');
      return;
    }

    addStaff({
      name: formData.name,
      role: formData.role,
      phone: formData.phone,
      commissionPct: formData.commissionPct,
      branchId: selectedBranchId
    });

    // Reset and close
    setFormData({
      name: '',
      role: 'Senior Stylist',
      phone: '',
      commissionPct: '20'
    });
    setIsAddModalOpen(false);
  };

  // Toggle paid status
  const handleTogglePaid = (staffId) => {
    setPaidStatus(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));
  };

  // Unique color generator for avatar background based on member.id
  const getAvatarBgColor = (id) => {
    const palettes = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-teal-100 text-teal-700 border-teal-200'
    ];
    return palettes[id % palettes.length];
  };

  // Sort Table by Commission Earned (descending)
  const tableSortedStaff = [...staffWithStats].sort((a, b) => b.commission - a.commission);

  // Sums for total row in Table
  const totalServicesDone = staffWithStats.reduce((sum, s) => sum + s.completedCount, 0);
  const totalRevenueGenerated = staffWithStats.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto select-none animate-slide-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff Management</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor stylist rosters, performance metrics, and monthly commissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white text-slate-700 placeholder-slate-400 text-xs font-semibold rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all w-60"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/10 flex items-center space-x-2 shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Stylist</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 — Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Staff */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Total Staff</p>
            <h3 className="text-3xl font-black text-slate-800">{totalStaffCount}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Active in selected branch</p>
          </div>
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Commission This Month */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Commission This Month</p>
            <h3 className="text-3xl font-black text-emerald-600">₹{totalCommissionThisMonth.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Calculated from completed services</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Top Performer */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
          <div className="space-y-1.5 w-[70%]">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Top Performer</p>
            {topPerformer ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 truncate">{topPerformer.name}</h3>
                <p className="text-xs text-amber-600 font-black mt-1">₹{topPerformer.revenue.toLocaleString('en-IN')} revenue</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-extrabold text-slate-400">N/A</h3>
                <p className="text-[10px] text-slate-400 font-semibold">No revenue recorded</p>
              </>
            )}
          </div>
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
            <Trophy className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* SECTION 2 — Staff Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-purple-650" />
          <span>Stylist Performance Cards</span>
        </h2>
        
        {filteredStaffWithStats.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center rounded-3xl border border-slate-100 space-y-3.5 shadow-sm animate-slide-in">
            <span className="text-4xl block">💇</span>
            <h4 className="font-extrabold text-slate-800 text-sm">No Stylists Registered</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">There are no stylists registered for this branch. Register employee rosters below to schedule calendars.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 hover:scale-105 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm shrink-0 inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Register Stylist</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStaffWithStats.map((member) => {
              // Percentage calculation for progress bar
              const percentOfTotal = branchTotalRevenue > 0 
                ? Math.round((member.revenue / branchTotalRevenue) * 100) 
                : 0;

              return (
                <div key={member.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between space-y-5">
                  {/* Top Bar: Avatar & Initial Details */}
                  <div className="flex items-start space-x-4">
                    {/* Unique Colored Avatar with Online Green Dot */}
                    <div className="relative">
                      <div className={`h-14 w-14 rounded-full flex items-center justify-center font-extrabold text-sm border-2 shadow-inner shrink-0 ${getAvatarBgColor(member.id)}`}>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-slate-800 text-base truncate">{member.name}</h4>
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-purple-200">
                          {member.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-xs text-slate-500 font-semibold space-x-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Commission Details Box (light purple background) */}
                  <div className="bg-purple-50/50 border border-purple-100/50 rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commission Rate</p>
                        <p className="font-extrabold text-slate-700 mt-0.5">{member.commissionPct}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services Done</p>
                        <p className="font-extrabold text-slate-700 mt-0.5">{member.completedCount} appointments</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2.5 border-t border-purple-100/40">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue Generated</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">₹{member.revenue.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commission Earned</p>
                        <p className="font-black text-emerald-600 mt-0.5 text-sm">₹{member.commission.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (Revenue vs Branch Total) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      <span>Contribution to Branch Revenue</span>
                      <span className="text-purple-700 font-extrabold">{percentOfTotal}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentOfTotal}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bottom: View Details Button */}
                  <button
                    onClick={() => setDetailedStaff(member)}
                    className="w-full text-center border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200 py-2.5 rounded-xl text-xs font-bold shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3 — Commission Summary Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Percent className="h-5 w-5 text-purple-650" />
          <span>Commission Summary Ledger</span>
        </h2>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="py-4 px-6">Staff Name</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Services Done</th>
                  <th className="py-4 px-6 text-right">Revenue Generated</th>
                  <th className="py-4 px-6 text-center">Commission %</th>
                  <th className="py-4 px-6 text-right">Commission Earned</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                {tableSortedStaff.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400 italic">No staff members in branch.</td>
                  </tr>
                ) : (
                  tableSortedStaff.map((member) => {
                    const isPaid = !!paidStatus[member.id];
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-extrabold text-slate-800">{member.name}</td>
                        <td className="py-4 px-6">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                            {member.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-600">{member.completedCount}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-800">₹{member.revenue.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-center font-bold text-purple-700">{member.commissionPct}%</td>
                        <td className="py-4 px-6 text-right font-black text-emerald-600">₹{member.commission.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleTogglePaid(member.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-150 ${
                              isPaid 
                                ? 'bg-emerald-600 text-white shadow-sm border border-transparent' 
                                : 'border border-emerald-500 text-emerald-650 hover:bg-emerald-50'
                            }`}
                          >
                            {isPaid ? 'Paid ✓' : 'Mark Paid'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                
                {/* Total Row */}
                {tableSortedStaff.length > 0 && (
                  <tr className="bg-slate-50/50 border-t border-slate-200 text-slate-800 font-extrabold">
                    <td className="py-4 px-6 text-slate-900" colSpan="2">Branch Total Sum</td>
                    <td className="py-4 px-6 text-center text-slate-900">{totalServicesDone}</td>
                    <td className="py-4 px-6 text-right text-slate-900">₹{totalRevenueGenerated.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-center text-slate-400">—</td>
                    <td className="py-4 px-6 text-right text-emerald-600 text-sm">₹{totalCommissionThisMonth.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-center text-slate-400">—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {detailedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 border border-slate-100 space-y-6 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-extrabold text-xs border shadow-inner shrink-0 ${getAvatarBgColor(detailedStaff.id)}`}>
                  {detailedStaff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    {detailedStaff.name}
                  </h3>
                  <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">{detailedStaff.role} • {detailedStaff.commissionPct}% Comm. Rate</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailedStaff(null)} 
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-150 p-2 rounded-xl transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body: Services done list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed Services breakdown (May 2026)</h4>
              
              {detailedStaff.appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-450 italic bg-slate-50 rounded-2xl border border-slate-150">
                  No completed appointments recorded for this employee this month.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {detailedStaff.appointments.map((appt) => (
                    <div key={appt.id} className="bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-2xl p-4 flex items-center justify-between text-xs transition-colors">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-800">{appt.serviceName}</p>
                        <div className="flex items-center text-[10px] text-slate-450 font-bold space-x-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{appt.date} • {appt.time}</span>
                          </span>
                          <span>|</span>
                          <span>Customer: {appt.customerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-850">₹{appt.amount}</p>
                        <p className="text-[10px] text-emerald-600 font-extrabold">₹{Math.round(appt.amount * (detailedStaff.commissionPct / 100))} commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Services</p>
                <p className="text-base font-extrabold text-purple-700 mt-1">{detailedStaff.completedCount}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <p className="text-base font-extrabold text-slate-800 mt-1">₹{detailedStaff.revenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Earned</p>
                <p className="text-base font-black text-emerald-600 mt-1">₹{detailedStaff.commission.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ADD STYLIST MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">Add Staff Stylist</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-650 bg-slate-50 hover:bg-slate-150 p-1.5 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stylist Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Role / Speciality *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                >
                  <option value="Senior Stylist">Senior Stylist</option>
                  <option value="Stylist">Stylist</option>
                  <option value="Hair Colorist">Hair Colorist</option>
                  <option value="Makeup Artist">Makeup Artist</option>
                  <option value="Nail Technician">Nail Technician</option>
                  <option value="Aesthetician">Aesthetician</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
              </div>

              {/* Commission Percentage */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commission Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.commissionPct}
                  onChange={(e) => setFormData(p => ({ ...p, commissionPct: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
              </div>

              {/* Submits */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/10"
                >
                  Save Stylist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

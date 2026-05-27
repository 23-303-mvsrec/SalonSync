import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Calendar, 
  CheckCircle,
  Clock,
  UserPlus,
  Percent,
  IndianRupee
} from 'lucide-react';

const Memberships = () => {
  const { 
    selectedBranchId,
    customers, 
    membershipPlans, 
    assignMembership,
    branches 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  // Enroll Form State
  const [enrollData, setEnrollData] = useState({
    customerId: '',
    planId: ''
  });

  // Filter customers by selected branch
  const branchCustomers = customers.filter(c => c.preferredBranch === selectedBranchId);

  // Filter out customers that already have memberships
  const nonMembers = branchCustomers.filter(c => !c.membershipId);

  // Active members list
  const activeMembers = branchCustomers.filter(c => c.membershipId).map(c => {
    const plan = membershipPlans.find(p => p.id === c.membershipId);
    const prefBranch = branches.find(b => b.id === c.preferredBranch) || branches[0];
    return {
      ...c,
      planName: plan ? plan.name : 'Unknown Plan',
      discountPct: plan ? plan.discountPct : 0,
      price: plan ? plan.price : 0,
      branchName: prefBranch.name
    };
  });

  // Filter active members by search term
  const filteredMembers = activeMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone.includes(searchTerm) ||
    m.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!enrollData.customerId || !enrollData.planId) {
      alert('Please select both a client and a membership plan.');
      return;
    }

    assignMembership(
      parseInt(enrollData.customerId, 10),
      parseInt(enrollData.planId, 10)
    );

    // Reset and Close
    setEnrollData({
      customerId: '',
      planId: ''
    });
    setIsEnrollModalOpen(false);
  };

  // Get plan icon based on category
  const getPlanCategoryIcon = (category) => {
    switch (category) {
      case 'Hair': return '✂️';
      case 'Nails': return '💅';
      default: return '👑';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto select-none animate-slide-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Membership Programs</h1>
          <p className="text-sm text-slate-400 mt-1">Design special subscription tiers, enroll loyal customers, and review monthly rewards</p>
        </div>
        
        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/10 flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Enroll Member</span>
        </button>
      </div>

      {/* SECTION 1 — Membership Plans Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-650" />
          <span>Active Membership Plans</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {membershipPlans.map((plan) => {
            const memberCount = customers.filter(c => c.membershipId === plan.id).length;
            return (
              <div 
                key={plan.id} 
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-250 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                {/* Background accent bubble */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full opacity-60 z-0"></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">{getPlanCategoryIcon(plan.category)}</span>
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-purple-200">
                      {plan.category} Service Focus
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-800">{plan.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline space-x-1.5 pt-2 border-t border-slate-50">
                    <span className="text-2xl font-black text-slate-850">₹{plan.price}</span>
                    <span className="text-[10px] text-slate-450 font-bold uppercase">/ monthly</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-emerald-600" />
                    <span className="font-extrabold text-slate-700">{plan.discountPct}% Discount Perk</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-150 px-2 py-0.5 rounded-full">
                    {memberCount} active members
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 — Subscriptions Registry Ledger */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-650" />
            <span>Subscribed Members Registry</span>
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search members or plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white text-slate-700 placeholder-slate-400 text-xs font-semibold rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all w-60"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <th className="py-4 px-6">Member Name</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Home Branch</th>
                  <th className="py-4 px-6">Active Plan</th>
                  <th className="py-4 px-6 text-center">Discount Perk</th>
                  <th className="py-4 px-6 text-center">Subscription Billing</th>
                  <th className="py-4 px-6 text-center">Renewal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-55 text-xs font-semibold text-slate-750">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center bg-white">
                      <div className="space-y-3 max-w-sm mx-auto">
                        <span className="text-3xl block">🎟️</span>
                        <h4 className="font-extrabold text-slate-700 text-xs">No Subscribed Members</h4>
                        <p className="text-[11px] text-slate-400">There are no customers enrolled in membership plans for this branch. Enroll a customer profile below.</p>
                        <button
                          onClick={() => setIsEnrollModalOpen(true)}
                          className="bg-purple-600 hover:bg-purple-700 hover:scale-105 text-white font-bold px-3.5 py-2 rounded-xl text-[10px] transition-all shadow-sm shrink-0 cursor-pointer"
                        >
                          Enroll Client
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-6 font-extrabold text-slate-800 flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-[10px]">
                          {member.name[0]}
                        </div>
                        <span>{member.name}</span>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6 text-slate-600 font-bold">{member.phone}</td>

                      {/* Home Branch */}
                      <td className="py-4 px-6 text-slate-655 font-bold truncate max-w-[160px]">{member.branchName}</td>

                      {/* Active Plan */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-150">
                          {member.planName}
                        </span>
                      </td>

                      {/* Discount Perk */}
                      <td className="py-4 px-6 text-center font-bold text-emerald-600">
                        {member.discountPct}% OFF
                      </td>

                      {/* Billing */}
                      <td className="py-4 px-6 text-center font-extrabold text-slate-800">
                        ₹{member.price} / mo
                      </td>

                      {/* Renewal Status */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center space-x-1 text-emerald-650 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3 text-emerald-650" />
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ENROLL MEMBER MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
                <Award className="h-4.5 w-4.5 text-purple-650" />
                <span>Enroll in Membership</span>
              </h3>
              <button 
                onClick={() => setIsEnrollModalOpen(false)} 
                className="text-slate-400 hover:text-slate-650 bg-slate-50 hover:bg-slate-150 p-1.5 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              {/* Customer Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Select Client *</label>
                <select
                  required
                  value={enrollData.customerId}
                  onChange={(e) => setEnrollData(p => ({ ...p, customerId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value="">-- Select Client --</option>
                  {nonMembers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
                {nonMembers.length === 0 && (
                  <p className="text-[9px] text-rose-500 font-bold mt-1">All clients are already members!</p>
                )}
              </div>

              {/* Plan Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Select Membership Plan *</label>
                <select
                  required
                  value={enrollData.planId}
                  onChange={(e) => setEnrollData(p => ({ ...p, planId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value="">-- Select Plan --</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price}/mo ({plan.discountPct}% off)</option>
                  ))}
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={nonMembers.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Memberships;

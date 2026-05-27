import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Plus, 
  Search, 
  Award, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const Customers = () => {
  const { 
    selectedBranchId,
    customers, 
    branches, 
    addCustomer 
  } = useApp();

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredBranch: selectedBranchId.toString()
  });

  // Filter customer database by selected branch
  const branchCustomers = customers.filter(cust => cust.preferredBranch === selectedBranchId);

  const filteredCustomers = branchCustomers.filter(cust => {
    const term = searchTerm.toLowerCase();
    return cust.name.toLowerCase().includes(term) || 
           cust.phone.includes(term) || 
           cust.email.toLowerCase().includes(term);
  });

  // Summarize stats
  const totalCustomers = branchCustomers.length;
  const totalPoints = branchCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  
  // Find top loyal member
  const topMember = branchCustomers.length > 0 
    ? [...branchCustomers].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)[0]
    : null;

  // Submit new customer profile
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Name and Phone are required.');
      return;
    }

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      loyaltyPoints: 0,
      totalVisits: 0,
      preferredBranch: parseInt(formData.preferredBranch, 10)
    });

    // Reset Form & Close
    setFormData({
      name: '',
      phone: '',
      email: '',
      preferredBranch: selectedBranchId.toString()
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Database</h1>
          <p className="text-xs text-slate-400">Manage client contact journals, visitation statistics, and loyalty logs</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/10 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* CRM Statistics Overview Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Base */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Clients</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalCustomers}</h3>
            <p className="text-[10px] text-slate-500 font-medium">All active branch directories combined</p>
          </div>
          <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl">
            <Users className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Metric 2: Loyalty Points Outstanding */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loyalty Credits Outstanding</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalPoints.toLocaleString()} pts</h3>
            <p className="text-[10px] text-slate-500 font-medium">Redeemable in POS billing checkouts</p>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
            <Award className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Metric 3: Top Loyal Member */}
        {topMember && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="space-y-1 overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VVIP Tier Member</p>
              <h3 className="text-sm font-extrabold text-slate-800 truncate">{topMember.name}</h3>
              <p className="text-[10px] text-amber-600 font-bold flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{topMember.loyaltyPoints} points • {topMember.totalVisits} visits</span>
              </p>
            </div>
            <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-700 placeholder-slate-400 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 border border-transparent focus:border-purple-300 transition-all"
          />
        </div>
      </div>

      {/* Customer Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 space-y-3.5 shadow-sm animate-slide-in">
            <span className="text-4xl block">👤</span>
            <h4 className="font-extrabold text-slate-800 text-sm">No Customers Registered</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">No client profiles are logged for this branch. Create a new client directory profile using the register portal.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 hover:scale-105 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Register Client Profile</span>
            </button>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const prefBranch = branches.find(b => b.id === cust.preferredBranch) || branches[0];
            return (
              <div key={cust.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5">
                
                {/* Profile header initials & loyalty tier */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {cust.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs">{cust.name}</h4>
                      <span className="inline-flex items-center text-[9px] text-slate-400 font-bold">
                        ID: #CUST-{cust.id}
                      </span>
                    </div>
                  </div>

                  {/* Star Loyalty Badge */}
                  <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    cust.loyaltyPoints >= 500 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}>
                    <Award className="h-3 w-3" />
                    <span>{cust.loyaltyPoints} pts</span>
                  </span>
                </div>

                {/* Contacts details & Home Branch */}
                <div className="space-y-2 border-y border-slate-50 py-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center space-x-2.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.email && (
                    <div className="flex items-center space-x-2.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500">Home Branch: {prefBranch.name}</span>
                  </div>
                </div>

                {/* Total Visits & Tier level */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Visits: <strong className="text-slate-700">{cust.totalVisits}</strong></span>
                  </span>
                  
                  {cust.totalVisits >= 15 ? (
                    <span className="text-purple-600 font-extrabold">Platinum Client</span>
                  ) : cust.totalVisits >= 5 ? (
                    <span className="text-indigo-500 font-extrabold">Gold Client</span>
                  ) : (
                    <span className="text-slate-400">Regular Client</span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">Add Customer Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Joshi"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>

              {/* Preferred Branch */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Home / Preferred Branch</label>
                <select
                  value={formData.preferredBranch}
                  onChange={(e) => setFormData(p => ({ ...p, preferredBranch: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-100"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl text-xs"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/10"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

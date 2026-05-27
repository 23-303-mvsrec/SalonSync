import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  User, 
  Trash2, 
  Percent, 
  Gift, 
  FileText, 
  Printer, 
  Check, 
  Search, 
  Plus,
  Scissors,
  CreditCard,
  QrCode,
  Share2,
  DollarSign
} from 'lucide-react';

const SESSION_DATE = '2026-05-26';

const POS = () => {
  const { 
    selectedBranchId, 
    services, 
    staff, 
    customers, 
    addAppointment,
    redeemCustomerPoints,
    addCustomer,
    branches,
    membershipPlans
  } = useApp();

  // POS State
  const [cart, setCart] = useState([]); // Array of { serviceId, name, price, duration, category, quantity }
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Customer Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');

  // Staff Assignment State
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Discount & Loyalty State
  const [discountPercent, setDiscountPercent] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, Card, UPI

  // Invoice State & Auto-increment ID
  const [invoiceCount, setInvoiceCount] = useState(() => {
    const saved = localStorage.getItem('salon_invoiceCount');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  
  // Service Catalog Search & Category Filter
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Toast notification state for clipboard copy
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('salon_invoiceCount', invoiceCount);
  }, [invoiceCount]);

  // Get active branch details
  const activeBranch = branches.find(b => b.id === selectedBranchId) || { name: 'SalonSync', city: 'India' };

  // Get active branch stylists
  const branchStylists = staff.filter(s => s.branchId === selectedBranchId);

  // Select first stylist as default on branch load
  useEffect(() => {
    if (branchStylists.length > 0) {
      setSelectedStaffId(branchStylists[0].id.toString());
    } else {
      setSelectedStaffId('');
    }
  }, [selectedBranchId]);

  // Active customer object
  const activeCustomer = customers.find(c => c.id === parseInt(selectedCustomerId, 10));

  // Determine loyalty tier
  const getLoyaltyTier = (points) => {
    if (points >= 1000) return { label: 'Platinum', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200 border', emoji: '💎' };
    if (points >= 500) return { label: 'Gold', badge: 'bg-amber-100 text-amber-800 border-amber-200 border', emoji: '🏆' };
    if (points >= 200) return { label: 'Silver', badge: 'bg-slate-100 text-slate-800 border-slate-200 border', emoji: '🥈' };
    return { label: 'Bronze', badge: 'bg-orange-100 text-orange-800 border-orange-250 border', emoji: '🥉' };
  };

  // Filter customer list for type-ahead search
  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    return c.name.toLowerCase().includes(query) || c.phone.includes(query);
  });

  // Services categories list
  const categories = ['All', 'Hair', 'Color', 'Skin', 'Nails', 'Makeup'];

  // Filter services by name and category
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Service dot category colors
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Hair': return 'bg-violet-500';
      case 'Color': return 'bg-pink-500';
      case 'Skin': return 'bg-blue-500';
      case 'Nails': return 'bg-amber-500';
      case 'Makeup': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  // Cart Management
  const handleAddToCart = (service) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === service.id);
      if (existing) {
        return prev.map(item => 
          item.serviceId === service.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        serviceId: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        category: service.category,
        quantity: 1
      }];
    });
  };

  const handleDecrementCart = (serviceId) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === serviceId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter(item => item.serviceId !== serviceId);
      }
      return prev.map(item => 
        item.serviceId === serviceId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const handleRemoveFromCart = (serviceId) => {
    setCart(prev => prev.filter(item => item.serviceId !== serviceId));
  };

  // Auto-increment Invoice ID
  const formattedInvoiceId = `INV-20260526-${String(invoiceCount).padStart(3, '0')}`;

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  // Membership Calculations
  const customerPlan = activeCustomer && activeCustomer.membershipId 
    ? membershipPlans.find(p => p.id === activeCustomer.membershipId) 
    : null;

  let membershipDiscountAmount = 0;
  if (customerPlan) {
    cart.forEach(item => {
      if (customerPlan.category === 'All' || item.category.toLowerCase() === customerPlan.category.toLowerCase()) {
        membershipDiscountAmount += Math.round(item.price * item.quantity * (customerPlan.discountPct / 100));
      }
    });
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount - membershipDiscountAmount);
  const gstAmount = Math.round(taxableAmount * 0.18);
  const grandTotalBeforeLoyalty = taxableAmount + gstAmount;

  // Loyalty calculations (100 pts = ₹10 => 1 pt = ₹0.10)
  let loyaltyPointsToRedeem = 0;
  let loyaltyDiscountAmount = 0;

  if (redeemPoints && activeCustomer) {
    // Max points that can be redeemed to pay for the bill
    const maxRedeemablePoints = Math.min(
      activeCustomer.loyaltyPoints,
      Math.floor(grandTotalBeforeLoyalty * 10) // Since 10 points = 1 rupee, grandTotal * 10 is max points needed
    );
    // Align to blocks of 10 points or just use max points
    loyaltyPointsToRedeem = maxRedeemablePoints;
    loyaltyDiscountAmount = Math.round(loyaltyPointsToRedeem * 0.1);
  }

  const grandTotal = Math.max(0, grandTotalBeforeLoyalty - loyaltyDiscountAmount);

  // Loyalty points earned on this bill (10% of grandTotal paid)
  const pointsEarned = Math.round(grandTotal * 0.1);

  // Selected stylist
  const selectedStylist = staff.find(s => s.id === parseInt(selectedStaffId, 10));

  // Generate Invoice handler
  const handleGenerateInvoice = () => {
    if (cart.length === 0) return;
    if (!isWalkIn && !selectedCustomerId) {
      alert('Please select a customer or check Walk-in Customer.');
      return;
    }
    if (!selectedStaffId) {
      alert('Please assign a staff stylist.');
      return;
    }

    const customerName = isWalkIn ? (walkInName.trim() || 'Walk-in Customer') : (activeCustomer ? activeCustomer.name : 'Walk-in Customer');
    const customerPhone = isWalkIn ? (walkInPhone.trim() || 'N/A') : (activeCustomer ? activeCustomer.phone : 'N/A');

    // 1. Process customer lookup/creation for DB sync
    let finalCustomerId = 0;
    if (isWalkIn && walkInPhone.trim()) {
      const existing = customers.find(c => c.phone === walkInPhone.trim());
      if (existing) {
        finalCustomerId = existing.id;
      } else {
        const newCust = addCustomer({
          name: customerName,
          phone: customerPhone,
          loyaltyPoints: 0,
          totalVisits: 0,
          preferredBranch: selectedBranchId
        });
        finalCustomerId = newCust.id;
      }
    } else if (activeCustomer) {
      finalCustomerId = activeCustomer.id;
    }

    // 2. Deduct redeemed points in global context
    if (loyaltyPointsToRedeem > 0 && finalCustomerId > 0) {
      redeemCustomerPoints(finalCustomerId, loyaltyPointsToRedeem);
    }

    // 3. Add appointments for each service item
    cart.forEach(item => {
      // Calculate item share of total amount paid
      const itemWeight = (item.price * item.quantity) / (subtotal || 1);
      const itemShareOfTotal = Math.round(grandTotal * itemWeight);

      addAppointment({
        customerId: finalCustomerId,
        customerName: customerName,
        staffId: selectedStylist ? selectedStylist.id : 0,
        staffName: selectedStylist ? selectedStylist.name : 'Any Stylist',
        serviceId: item.serviceId,
        serviceName: item.name,
        branchId: selectedBranchId,
        date: SESSION_DATE,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'completed',
        source: 'walkin',
        amount: itemShareOfTotal
      });
    });

    // 4. Capture Invoice Details
    setInvoiceDetails({
      invoiceNo: formattedInvoiceId,
      branchName: activeBranch.name,
      branchAddress: `${activeBranch.name}, Banjara Hills, Road No. 12, Hyderabad`,
      customerName,
      customerPhone,
      customerPoints: activeCustomer ? activeCustomer.loyaltyPoints : 0,
      customerTier: activeCustomer ? getLoyaltyTier(activeCustomer.loyaltyPoints).label : 'None',
      customerTierEmoji: activeCustomer ? getLoyaltyTier(activeCustomer.loyaltyPoints).emoji : '',
      services: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      subtotal,
      discountPercent,
      discountAmount,
      membershipName: customerPlan ? customerPlan.name : null,
      membershipDiscountAmount: membershipDiscountAmount,
      taxableAmount,
      cgst: Math.round(gstAmount / 2),
      sgst: Math.round(gstAmount / 2),
      pointsRedeemed: loyaltyPointsToRedeem,
      pointsRedeemedDiscount: loyaltyDiscountAmount,
      pointsEarned,
      total: grandTotal,
      paymentMethod,
      date: '26 May 2026',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    });

    setShowInvoice(true);
  };

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  // Share receipt summary
  const handleShareReceipt = () => {
    if (!invoiceDetails) return;
    const summaryText = `✂ SalonSync TAX INVOICE
Invoice: ${invoiceDetails.invoiceNo}
Date: ${invoiceDetails.date}
Branch: ${invoiceDetails.branchName}
Customer: ${invoiceDetails.customerName}
----------------------------
${invoiceDetails.services.map(s => `${s.name} x${s.quantity} @ ₹${s.price}`).join('\n')}
----------------------------
Subtotal: ₹${invoiceDetails.subtotal}
Discount: -₹${invoiceDetails.discountAmount + invoiceDetails.pointsRedeemedDiscount}
GST (18%): ₹${invoiceDetails.cgst + invoiceDetails.sgst}
TOTAL PAID: ₹${invoiceDetails.total}
Payment Method: ${invoiceDetails.paymentMethod}
Points Earned: +${invoiceDetails.pointsEarned} pts
Thank you! Visit again at SalonSync 🌸`;

    navigator.clipboard.writeText(summaryText);
    triggerToast('Copied!');
  };

  // Reset POS states for a new bill
  const handleNewBill = () => {
    setInvoiceCount(prev => prev + 1);
    setCart([]);
    setSelectedCustomerId('');
    setSearchQuery('');
    setShowSearchDropdown(false);
    setIsWalkIn(false);
    setWalkInName('');
    setWalkInPhone('');
    setDiscountPercent(0);
    setRedeemPoints(false);
    setPaymentMethod('Cash');
    setShowInvoice(false);
    setInvoiceDetails(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto relative">
      
      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-xl z-[60] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Point of Sale (POS)</h1>
        <p className="text-sm text-slate-500">Live bill generation, loyalty points calculator, and instant tax invoice printer.</p>
      </div>

      {/* Desktop 3-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT PANEL (35%): Customer & Staff */}
        <div className="w-full lg:w-[35%] space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="bg-violet-600 py-3.5 px-5 text-white font-bold text-sm tracking-wide flex items-center space-x-2">
              <User className="h-4.5 w-4.5" />
              <span>Customer & Staff</span>
            </div>

            <div className="p-5 space-y-5">
              {/* Walk-in Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="walkin-checkbox"
                  checked={isWalkIn}
                  onChange={(e) => {
                    setIsWalkIn(e.target.checked);
                    setSelectedCustomerId('');
                    setSearchQuery('');
                    setRedeemPoints(false);
                  }}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="walkin-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Walk-in Customer
                </label>
              </div>

              {/* Customer Selector / Inputs */}
              {isWalkIn ? (
                <div className="grid grid-cols-1 gap-3.5 animate-slide-in">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Guest Customer"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Customer</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSearchDropdown(true);
                        }}
                        onFocus={() => setShowSearchDropdown(true)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-300"
                      />
                    </div>

                    {/* Customer Dropdown Results */}
                    {showSearchDropdown && searchQuery && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-150 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto">
                        {filteredCustomers.length === 0 ? (
                          <div className="p-3.5 text-center text-xs text-slate-400 font-semibold">
                            No customers found.
                          </div>
                        ) : (
                          filteredCustomers.map(cust => (
                            <div
                              key={cust.id}
                              onClick={() => {
                                setSelectedCustomerId(cust.id.toString());
                                setSearchQuery('');
                                setShowSearchDropdown(false);
                              }}
                              className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 font-extrabold flex items-center justify-center text-xs">
                                  {cust.name[0]}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold text-slate-800">{cust.name}</p>
                                  <p className="text-[10px] text-slate-400">{cust.phone}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-150">
                                {cust.loyaltyPoints} pts
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Customer Card */}
                  {activeCustomer && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 animate-slide-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">{activeCustomer.name}</span>
                        <button
                          onClick={() => setSelectedCustomerId('')}
                          className="text-[10px] text-slate-400 hover:text-rose-500 font-bold"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-450 font-bold">{activeCustomer.phone}</p>
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${getLoyaltyTier(activeCustomer.loyaltyPoints).badge}`}>
                          Loyalty: {getLoyaltyTier(activeCustomer.loyaltyPoints).label} {getLoyaltyTier(activeCustomer.loyaltyPoints).emoji}
                        </span>
                        <span className="text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-150 px-2 py-0.5 rounded-full">
                          Balance: {activeCustomer.loyaltyPoints} pts
                        </span>
                        {customerPlan && (
                          <span className="text-[9px] font-extrabold bg-purple-600 text-white border border-purple-600 px-2 py-0.5 rounded-full shadow-sm">
                            ★ Member: {customerPlan.name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Staff Assignment */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Assignment *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-100"
                >
                  <option value="">-- Assign Stylist --</option>
                  {branchStylists.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>

                {selectedStylist && (
                  <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 flex items-center justify-between gap-2 animate-slide-in">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8.5 w-8.5 rounded-full bg-violet-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                        {selectedStylist.name.split(' ').map(p => p[0]).join('')}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">{selectedStylist.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{selectedStylist.role}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold bg-violet-100 text-violet-850 px-2 py-1 rounded-full border border-violet-200 shrink-0">
                      Commission: {selectedStylist.commissionPct}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL (40%): Service Catalog */}
        <div className="w-full lg:w-[40%] space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-base">Select Services</h3>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-700 placeholder-slate-400 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-300"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 border ${
                    activeCategory === cat
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-600/10'
                      : 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service grid (2 columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredServices.map(service => {
                const cartItem = cart.find(item => item.serviceId === service.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
                  <div 
                    key={service.id}
                    className={`bg-white border rounded-2xl p-4 transition-all duration-250 flex flex-col justify-between space-y-4 hover:shadow-md ${
                      quantity > 0 
                        ? 'border-violet-300 bg-violet-50/10 shadow-sm'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${getCategoryColor(service.category)}`} />
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">{service.category}</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-xs leading-snug">{service.name}</h4>
                      
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-450 font-bold text-[9px] rounded">
                          {service.duration} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-slate-100/80 pt-3 mt-2">
                      <span className="font-extrabold text-emerald-600 text-xs">₹{service.price}</span>
                      
                      {/* Quantity control */}
                      {quantity === 0 ? (
                        <button
                          onClick={() => handleAddToCart(service)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all shadow-sm shadow-purple-600/10 flex items-center space-x-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleDecrementCart(service.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-650 font-black px-2 py-1 text-xs transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3.5 text-xs font-bold text-slate-700 bg-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleAddToCart(service)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-650 font-black px-2 py-1 text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL (25%): Live Bill Summary */}
        <div className="w-full lg:w-[25%] lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center space-x-2 text-slate-800">
                <FileText className="h-4.5 w-4.5 text-violet-600" />
                <span className="font-bold text-sm">Bill Summary</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400">{formattedInvoiceId}</span>
            </div>

            {/* Line Items */}
            <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium italic">
                  No services added. Click on "+ Add" to populate bill.
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.serviceId} 
                    className="flex justify-between items-center group bg-slate-50 p-2.5 rounded-xl border border-slate-100 relative overflow-hidden animate-slide-in"
                  >
                    <div className="text-left space-y-0.5">
                      <p className="font-bold text-xs text-slate-850 truncate max-w-[120px]">{item.name}</p>
                      <p className="text-[10px] text-slate-450 font-bold">
                        {item.quantity} x ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-bold text-slate-750">₹{item.price * item.quantity}</span>
                      
                      {/* Hover X remove button */}
                      <button
                        onClick={() => handleRemoveFromCart(item.serviceId)}
                        className="text-slate-350 hover:text-rose-500 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                        title="Remove service"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Section */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {/* Discount stepper [-] [ 0 %] [+] */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-650 flex items-center space-x-1">
                    <Percent className="h-3.5 w-3.5 text-slate-400" />
                    <span>Discount</span>
                  </span>
                  
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setDiscountPercent(p => Math.max(0, p - 1))}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-150 transition-colors font-extrabold text-xs"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-700 bg-white min-w-[32px] text-center">
                      {discountPercent}%
                    </span>
                    <button
                      onClick={() => setDiscountPercent(p => Math.min(100, p + 1))}
                      className="px-2.5 py-1 text-slate-500 hover:bg-slate-150 transition-colors font-extrabold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-rose-500">
                    <span>Discount Value</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {membershipDiscountAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-violet-600">
                    <span>Member Disc. ({customerPlan.name})</span>
                    <span>-₹{membershipDiscountAmount}</span>
                  </div>
                )}

                {/* Taxable Amount */}
                <div className="flex justify-between text-xs font-bold text-slate-600 border-t border-slate-50 pt-2">
                  <span>Taxable Amount</span>
                  <span>₹{taxableAmount}</span>
                </div>

                {/* GST @18% CGST 9% + SGST 9% */}
                <div className="space-y-0.5 text-right">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>GST @18%</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-semibold leading-none">
                    (CGST 9% + SGST 9%)
                  </span>
                </div>

                {/* Loyalty points block */}
                {!isWalkIn && activeCustomer && (
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-150 space-y-2 pt-2.5">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                      <span>Loyalty Credit</span>
                      <span className="text-emerald-600">+{pointsEarned} pts earned</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold">
                      <span>Current: {activeCustomer.loyaltyPoints} pts</span>
                      
                      {activeCustomer.loyaltyPoints >= 10 && (
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="checkbox"
                            id="redeem-checkbox"
                            checked={redeemPoints}
                            onChange={(e) => setRedeemPoints(e.target.checked)}
                            className="h-3 w-3 text-violet-600 border-slate-300 rounded cursor-pointer"
                          />
                          <label htmlFor="redeem-checkbox" className="text-[9px] font-bold text-slate-700 cursor-pointer select-none">
                            Redeem points
                          </label>
                        </div>
                      )}
                    </div>

                    {redeemPoints && loyaltyPointsToRedeem > 0 && (
                      <div className="flex justify-between text-[11px] font-bold text-amber-600 pt-1 border-t border-dashed border-slate-200">
                        <span>Redeemed {loyaltyPointsToRedeem} pts</span>
                        <span>-₹{loyaltyDiscountAmount}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TOTAL */}
                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-800">TOTAL</span>
                  <span className="text-2xl font-black text-violet-600">
                    ₹{grandTotal}
                  </span>
                </div>

                {/* Payment Selection */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'Card', 'UPI'].map(method => {
                      const isSelected = paymentMethod === method;
                      const getEmoji = (m) => {
                        if (m === 'Cash') return '💵';
                        if (m === 'Card') return '💳';
                        return '📱';
                      };

                      return (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2.5 px-1 rounded-xl text-[10px] font-extrabold tracking-wide uppercase border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 relative ${
                            isSelected
                              ? 'border-violet-600 bg-violet-50/40 text-violet-700 shadow-sm shadow-violet-600/5'
                              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-base leading-none">{getEmoji(method)}</span>
                          <span>{method}</span>
                          {isSelected && (
                            <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-violet-600 text-white rounded-full flex items-center justify-center text-[7px]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generate Invoice button */}
                <button
                  onClick={handleGenerateInvoice}
                  disabled={cart.length === 0 || (!isWalkIn && !selectedCustomerId)}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white font-extrabold py-4 rounded-xl transition-all duration-200 shadow-md shadow-violet-600/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider mt-2.5"
                >
                  Generate Invoice ₹{grandTotal}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* INVOICE MODAL */}
      {showInvoice && invoiceDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 border border-slate-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal actions heading (invisible when printing) */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
                <Check className="h-4.5 w-4.5 text-emerald-600 border border-emerald-250 bg-emerald-50 rounded-full p-0.5" />
                <span>Invoice Finalized</span>
              </h3>
              <button 
                onClick={handleNewBill}
                className="text-slate-400 hover:text-slate-650 text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Print-ready Template Container */}
            <div 
              id="print-area" 
              className="bg-white p-6 md:p-8 rounded-2xl border border-slate-300 shadow-sm max-w-xl mx-auto text-slate-850 font-mono text-sm leading-relaxed"
              style={{ minWidth: '400px' }}
            >
              {/* Header */}
              <div className="border-b border-dashed border-slate-350 pb-4 text-center">
                <div className="flex items-center justify-between font-bold text-base uppercase">
                  <span>✂ SalonSync</span>
                  <span>TAX INVOICE</span>
                </div>
                <div className="text-left text-xs text-slate-500 mt-2 space-y-0.5">
                  <p>{invoiceDetails.branchName}</p>
                  <p>Banjara Hills, Road No. 12, Hyderabad</p>
                  <div className="flex justify-between mt-2 font-semibold">
                    <span>GSTIN: 36XXXXX1234X1ZX</span>
                    <span>Date: {invoiceDetails.date}</span>
                  </div>
                  <div className="flex justify-between mt-0.5 font-semibold">
                    <span>Invoice: {invoiceDetails.invoiceNo}</span>
                    <span>Time: {invoiceDetails.time}</span>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="border-b border-dashed border-slate-350 py-4 text-xs">
                <div className="flex justify-between font-bold uppercase">
                  <span>BILL TO:</span>
                  {invoiceDetails.customerTier !== 'None' && (
                    <span>Loyalty: {invoiceDetails.customerTier} {invoiceDetails.customerTierEmoji}</span>
                  )}
                </div>
                <div className="mt-1.5 space-y-0.5 font-semibold">
                  <p>{invoiceDetails.customerName}</p>
                  <p>Ph: {invoiceDetails.customerPhone}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-4">
                <table className="w-full text-xs font-mono font-semibold">
                  <thead>
                    <tr className="border-b border-dashed border-slate-350 text-slate-500 uppercase">
                      <th className="text-left pb-2 w-10">S.No</th>
                      <th className="text-left pb-2">Service</th>
                      <th className="text-right pb-2 w-16">Rate</th>
                      <th className="text-right pb-2 w-12">Qty</th>
                      <th className="text-right pb-2 w-20">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetails.services.map((s, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5">{idx + 1}</td>
                        <td className="py-2.5 truncate max-w-[180px]">{s.name}</td>
                        <td className="py-2.5 text-right">₹{s.price}</td>
                        <td className="py-2.5 text-right">{s.quantity}</td>
                        <td className="py-2.5 text-right">₹{s.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations Block */}
              <div className="border-t border-dashed border-slate-350 pt-4 space-y-1.5 text-xs text-right font-mono font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span>₹{invoiceDetails.subtotal}</span>
                </div>
                {invoiceDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span className="text-slate-500">Discount ({invoiceDetails.discountPercent}%):</span>
                    <span>-₹{invoiceDetails.discountAmount}</span>
                  </div>
                )}
                {invoiceDetails.membershipDiscountAmount > 0 && (
                  <div className="flex justify-between text-violet-700">
                    <span className="text-slate-500">Member Discount ({invoiceDetails.membershipName}):</span>
                    <span>-₹{invoiceDetails.membershipDiscountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxable Amount:</span>
                  <span>₹{invoiceDetails.taxableAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CGST @9%:</span>
                  <span>₹{invoiceDetails.cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SGST @9%:</span>
                  <span>₹{invoiceDetails.sgst}</span>
                </div>
                {invoiceDetails.pointsRedeemedDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 border-t border-slate-100 pt-1">
                    <span className="text-slate-500">Redeem ({invoiceDetails.pointsRedeemed} pts):</span>
                    <span>-₹{invoiceDetails.pointsRedeemedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold border-t border-dashed border-slate-350 pt-2.5 mt-2 text-slate-900">
                  <span>TOTAL:</span>
                  <span>₹{invoiceDetails.total}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-dashed border-slate-350 mt-6 pt-4 text-center text-xs space-y-2 font-mono font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Points Earned: +{invoiceDetails.pointsEarned} pts</span>
                  <span>Payment: {invoiceDetails.paymentMethod}</span>
                </div>
                <p className="pt-2 text-slate-650">
                  Thank you! Visit again at SalonSync 🌸
                </p>
              </div>

            </div>

            {/* Modal Bottom Action Controls (no-print) */}
            <div className="flex space-x-3 pt-3 border-t border-slate-100 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-150 hover:bg-slate-200 text-slate-650 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="h-4.5 w-4.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleShareReceipt}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/10"
              >
                <Share2 className="h-4.5 w-4.5" />
                <span>Share</span>
              </button>
              <button
                onClick={handleNewBill}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-violet-600/10"
              >
                <Check className="h-4.5 w-4.5" />
                <span>New Bill</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default POS;

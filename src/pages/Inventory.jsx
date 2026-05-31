import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Search, 
  X, 
  Minus, 
  Edit2, 
  Layers, 
  IndianRupee 
} from 'lucide-react';

const Inventory = () => {
  const { 
    selectedBranchId, 
    inventory, 
    updateInventoryQuantity, 
    addInventoryItem,
    updateInventoryItem
  } = useApp();

  const location = useLocation();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // Read ?lowStock=1 URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('lowStock') === '1') {
      setShowOnlyLowStock(true);
    }
  }, [location.search]);

  // Alert Banner dismissal state
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means Add Mode, item object means Edit Mode
  const [formData, setFormData] = useState({
    name: '',
    category: 'Color',
    quantity: '10',
    minStock: '5',
    unit: 'pieces',
    price: '300'
  });

  // Filter inventory by selected branch
  const branchInventory = inventory.filter(item => item.branchId === selectedBranchId);

  // Low stock criteria: quantity < minStock
  const lowStockItems = branchInventory.filter(item => item.quantity < item.minStock);
  const lowStockCount = lowStockItems.length;

  // Reset alert banner dismissal if selected branch changes or low stock item count changes
  useEffect(() => {
    setIsBannerDismissed(false);
  }, [selectedBranchId, lowStockCount]);

  // Categories list for filter tabs (Section 5)
  const categoryTabs = ['All', 'Color', 'Shampoo', 'Wax', 'Nails', 'Skin', 'Hair', 'Men', 'Supplies'];

  // Filter and search logic
  const filteredInventory = branchInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLowStock = !showOnlyLowStock || item.quantity < item.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Submit Handler for Add / Edit Modal
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.minStock) {
      alert('Please fill out all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity, 10),
      minStock: parseInt(formData.minStock, 10),
      unit: formData.unit,
      price: parseFloat(formData.price) || 0,
      branchId: selectedBranchId
    };

    if (editingItem) {
      // Edit Mode
      updateInventoryItem(editingItem.id, payload);
    } else {
      // Add Mode
      addInventoryItem(payload);
    }

    // Reset and Close
    setFormData({
      name: '',
      category: 'Color',
      quantity: '10',
      minStock: '5',
      unit: 'pieces',
      price: '300'
    });
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // Open modal in Edit Mode
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      unit: item.unit,
      price: item.price.toString()
    });
    setIsModalOpen(true);
  };

  // Open modal in Add Mode
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Color',
      quantity: '10',
      minStock: '5',
      unit: 'pieces',
      price: '300'
    });
    setIsModalOpen(true);
  };

  // Helper: status formatting
  const getStatusDetails = (item) => {
    if (item.quantity <= 0) {
      return {
        label: 'Out of Stock',
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
        hasIcon: false
      };
    }
    if (item.quantity < item.minStock) {
      return {
        label: 'Low Stock',
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
        hasIcon: true
      };
    }
    return {
      label: 'In Stock',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      hasIcon: false
    };
  };

  // Helper: row background styling
  const getRowBgClass = (item) => {
    if (item.quantity <= 0) {
      return 'bg-red-50/40 hover:bg-red-50/70 transition-colors';
    }
    if (item.quantity < item.minStock) {
      return 'bg-amber-50/30 hover:bg-amber-50/50 transition-colors';
    }
    return 'bg-white hover:bg-slate-50/60 transition-colors';
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto select-none">
      
      <div className="space-y-6 animate-slide-in">
        {/* SECTION 1 — Top Bar & summary cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-slate-400 mt-1">Track salon materials, professional color tubes, and retail stock</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white text-slate-700 placeholder-slate-400 text-xs font-semibold rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all w-60"
            />
          </div>

          {showOnlyLowStock && (
            <button
              onClick={() => setShowOnlyLowStock(false)}
              className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors hover:bg-rose-100 shrink-0"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Low Stock Only
              <X className="h-3.5 w-3.5 ml-1" />
            </button>
          )}
          
          <button
            onClick={handleOpenAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-purple-900/10 flex items-center space-x-2 shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Metrics summary cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Items in Branch Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Total Items</p>
            <h3 className="text-3xl font-black text-slate-800">{branchInventory.length}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Products registered in this branch</p>
          </div>
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between transition-all group ${
          lowStockCount > 0 
            ? 'bg-rose-50/20 border-rose-250 ring-2 ring-rose-100 ring-opacity-60' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Low Stock Alerts</p>
            <div className="flex items-center gap-2">
              <h3 className={`text-3xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-850'}`}>
                {lowStockCount}
              </h3>
              {lowStockCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Below specified minimum thresholds</p>
          </div>
          <div className={`p-4 rounded-2xl transition-colors duration-300 ${
            lowStockCount > 0 
              ? 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' 
              : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* SECTION 2 — Low Stock Alert Banner */}
      {lowStockCount > 0 && !isBannerDismissed && (
        <div className="bg-red-50/90 border border-red-200 shadow-md rounded-2xl p-5 flex items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-center space-x-3.5">
            <div className="bg-red-100 text-red-650 p-2.5 rounded-xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-950 text-sm">⚠️ {lowStockCount} items are running low! Reorder immediately.</h4>
              <p className="text-xs text-red-750 font-bold mt-1">
                Running low: <span className="underline decoration-red-300 font-extrabold">{lowStockItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsBannerDismissed(true)} 
            className="text-red-400 hover:text-red-750 bg-red-100/50 hover:bg-red-200/50 p-1.5 rounded-lg transition-all shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SECTION 5 — Category filter tabs above table */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Layers className="h-4 w-4 text-purple-650" />
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Filter by category</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border duration-150 ${
                  isActive
                    ? 'bg-purple-600 text-white border-transparent shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3 — Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                <th className="py-4 px-6">Item Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-center">Current Stock</th>
                <th className="py-4 px-6 text-center">Min Stock Threshold</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Unit Price</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center bg-white">
                    <div className="space-y-3 max-w-sm mx-auto animate-slide-in">
                      <span className="text-3xl block">📦</span>
                      <h4 className="font-extrabold text-slate-800 text-xs">No Products Found</h4>
                      <p className="text-[11px] text-slate-400">There are no coloring tubes, shampoos, or styling materials registered for this branch or category. Add items below.</p>
                      <button
                        onClick={handleOpenAdd}
                        className="bg-purple-600 hover:bg-purple-700 hover:scale-105 text-white font-bold px-3.5 py-2 rounded-xl text-[10px] transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        Add Stock Item
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStatusDetails(item);
                  return (
                    <tr key={item.id} className={getRowBgClass(item)}>
                      {/* Item Name */}
                      <td className="py-4 px-6 font-extrabold text-slate-800">{item.name}</td>
                      
                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="text-[10px] bg-slate-100/80 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-6 text-center font-bold">
                        <span className={item.quantity < item.minStock ? 'text-red-650 font-black' : 'text-slate-800'}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>

                      {/* Min Stock */}
                      <td className="py-4 px-6 text-center font-bold text-slate-500">
                        {item.minStock} {item.unit}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${status.badgeClass}`}>
                          {status.hasIcon && <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />}
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-6 text-right font-bold text-slate-800">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => updateInventoryQuantity(item.id, Number(item.quantity) - 1)}
                            disabled={Number(item.quantity) <= 0}
                            className="h-7 w-7 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 disabled:opacity-40 disabled:hover:bg-white rounded-lg flex items-center justify-center transition-colors shadow-sm focus:outline-none"
                            title="Decrease quantity by 1"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => updateInventoryQuantity(item.id, Number(item.quantity) + 1)}
                            className="h-7 w-7 bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-650 rounded-lg flex items-center justify-center transition-colors shadow-sm focus:outline-none"
                            title="Increase quantity by 1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="h-7 w-7 bg-white hover:bg-purple-50 border border-slate-200 text-purple-650 rounded-lg flex items-center justify-center transition-colors shadow-sm focus:outline-none"
                            title="Edit product details"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      {/* SECTION 4 — Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">
                {editingItem ? 'Edit Product Item' : 'Add Inventory Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-655 bg-slate-50 hover:bg-slate-150 p-1.5 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loreal Hair Shampoo"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                />
              </div>

              {/* Category dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                >
                  <option value="Color">Color</option>
                  <option value="Shampoo">Shampoo</option>
                  <option value="Wax">Wax</option>
                  <option value="Nails">Nails</option>
                  <option value="Skin">Skin</option>
                  <option value="Hair">Hair</option>
                  <option value="Men">Men</option>
                  <option value="Supplies">Supplies</option>
                </select>
              </div>

              {/* Quantity & Min Stock Threshold */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-255 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min Threshold *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData(p => ({ ...p, minStock: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-255 transition-all"
                  />
                </div>
              </div>

              {/* Unit (text) & Price per Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit (e.g. tubes) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bottles"
                    value={formData.unit}
                    onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-255 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price per Unit *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-purple-255 transition-all"
                  />
                </div>
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
                  {editingItem ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ChevronDown } from 'lucide-react';

const BranchSelector = () => {
  const { branches, selectedBranchId, setSelectedBranchId } = useApp();

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <div className="flex items-center space-x-3">
      {/* Live Badge */}
      <div className="flex items-center space-x-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">Live</span>
      </div>

      {/* Styled Dropdown Container */}
      <div className="relative group">
        <div className="flex items-center space-x-2 bg-white border-2 border-purple-200 hover:border-purple-500 transition-colors duration-200 rounded-xl px-3 py-1.5 shadow-sm cursor-pointer min-w-[220px]">
          <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(parseInt(e.target.value, 10))}
            className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none pr-6"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id} className="text-slate-800 font-medium">
                {branch.name} ({branch.city})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchSelector;

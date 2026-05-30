import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DateSelector = () => {
  const { currentDate, setCurrentDate } = useApp();

  const handlePrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  const handleToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  // Format date for user display: e.g. "Sat, 30 May 2026"
  const formatDateDisplay = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  return (
    <div className="flex items-center space-x-2 shrink-0">
      {/* Date Navigation Pill */}
      <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1">
        <button
          onClick={handlePrevDay}
          type="button"
          title="Previous Day"
          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Date Display with Picker Trigger */}
        <div className="relative flex items-center px-3 space-x-2">
          <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700 min-w-[125px] text-center select-none">
            {formatDateDisplay(currentDate)}
          </span>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) {
                setCurrentDate(e.target.value);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            title="Pick a Date"
          />
        </div>

        <button
          onClick={handleNextDay}
          type="button"
          title="Next Day"
          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Today button shortcut */}
      <button
        onClick={handleToday}
        type="button"
        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 border ${
          currentDate === todayStr
            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        Today
      </button>
    </div>
  );
};

export default DateSelector;

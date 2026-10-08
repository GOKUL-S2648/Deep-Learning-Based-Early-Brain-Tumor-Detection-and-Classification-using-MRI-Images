import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  const emptyDays = Array.from({ length: startingDayIndex });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
      >
        <CalendarIcon className="w-4 h-4 text-indigo-600" />
        {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Filter by Date'}
        {selectedDate && (
          <div 
            onClick={(e) => { e.stopPropagation(); onChange(null); setIsOpen(false); }}
            className="ml-1 p-0.5 hover:bg-slate-200 rounded-full"
          >
            <X className="w-3 h-3 text-slate-500" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">
              Select Date
            </div>
            <div className="text-2xl font-bold">
              {selectedDate ? format(selectedDate, 'EEE, MMM d') : format(currentMonth, 'EEE, MMM d')}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-bold text-slate-800 text-sm">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-xs font-bold text-slate-400">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day, i) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(day);
                      setIsOpen(false);
                    }}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto transition-all
                      ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 
                        isToday ? 'border border-indigo-600 text-indigo-600' : 
                        'text-slate-700 hover:bg-slate-100'}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800">
                CANCEL
              </button>
              <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

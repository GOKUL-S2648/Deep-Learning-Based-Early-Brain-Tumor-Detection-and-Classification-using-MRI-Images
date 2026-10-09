import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, setYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Edit2 } from 'lucide-react';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [view, setView] = useState<'days' | 'years'>('days');

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  const emptyDays = Array.from({ length: startingDayIndex });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const currentYearNum = currentMonth.getFullYear();
  const years = Array.from({ length: 24 }, (_, i) => currentYearNum - 12 + i);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors bg-transparent border-none p-0 cursor-pointer"
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Filter by Date'}</span>
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
        <div className="absolute top-full right-0 mt-2 z-50 w-[280px] bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200" style={{ borderRadius: '4px' }}>
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200 mb-2">
              Select Date
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold tracking-tight">
                {selectedDate ? format(selectedDate, 'EEE, MMM d') : format(currentMonth, 'EEE, MMM d')}
              </div>
              <button className="text-indigo-200 hover:text-white transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              onClick={() => setView(view === 'days' ? 'years' : 'days')}
              className="font-bold text-slate-800 text-sm flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              {format(currentMonth, 'MMMM yyyy')} <span className="text-xs ml-1 text-slate-500">{view === 'days' ? '▼' : '▲'}</span>
            </button>
            {view === 'days' && (
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {view === 'years' ? (
            /* Calendar Grid (Years) */
            <div className="px-2 pb-2">
              <div className="grid grid-cols-3 gap-y-4 gap-x-1 text-center py-2 h-[220px] overflow-y-auto custom-scrollbar">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      setCurrentMonth(setYear(currentMonth, year));
                      setView('days');
                    }}
                    className={`py-2 rounded-full text-sm transition-colors mx-2 ${
                      year === currentYearNum
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-4 mt-2 pt-3 px-2 pb-2">
                <button onClick={() => setIsOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-slate-800 tracking-wide uppercase">
                  Cancel
                </button>
                <button onClick={() => setIsOpen(false)} className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 tracking-wide uppercase">
                  OK
                </button>
              </div>
            </div>
          ) : (
            /* Calendar Grid (Days) */
            <div className="px-4 pb-2">
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
                      }}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs mx-auto transition-all
                        ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30' : 
                          isToday ? 'border border-indigo-600 text-indigo-600 font-bold' : 
                          'text-slate-700 hover:bg-slate-100'}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4 mt-4 pt-3 pb-2">
                <button onClick={() => setIsOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-slate-800 tracking-wide uppercase">
                  Cancel
                </button>
                <button onClick={() => setIsOpen(false)} className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 tracking-wide uppercase">
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval, 
  differenceInDays,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { LicenseEvent, FilterState } from '../types';
import { MOCK_DATA } from '../constants';
import { cn } from '../utils/cn';
import { motion } from 'motion/react';
import { EventModal } from './EventModal';
import { FilterBar } from './FilterBar';

interface CalendarProps {
  events: LicenseEvent[];
}

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Default to May 2026 as per base data
  const [filters, setFilters] = useState<FilterState>({ project: '全部', category: '全部' });
  const [selectedEvent, setSelectedEvent] = useState<LicenseEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const projectMatch = filters.project === '全部' || event.project === filters.project;
      const categoryMatch = filters.category === '全部' || event.category === filters.category;
      return projectMatch && categoryMatch;
    });
  }, [filters, events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Filter */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-vivid-purple p-3 rounded-2xl shadow-lg rotate-[-2deg]">
              <CalendarIcon className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-shine-dark tracking-tight">
                興安營造 <span className="text-vivid-purple">回訓排程</span>
              </h1>
              <p className="text-gray-400 font-bold mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-vivid-green rounded-full animate-pulse"></span>
                {format(currentDate, 'yyyy 年 MM 月')} 分配現況
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-xl">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-shine-light rounded-full transition-all text-gray-400 hover:text-shine-red"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="px-6 font-serif font-black text-lg text-shine-dark min-w-[140px] text-center">
              {format(currentDate, 'yyyy / MM')}
            </div>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-shine-light rounded-full transition-all text-gray-400 hover:text-shine-red"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <FilterBar filters={filters} setFilters={setFilters} />
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Week Days */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-shine-light/50">
          {weekDays.map((day, i) => (
            <div 
              key={day} 
              className={cn(
                "py-4 text-center font-serif font-black text-sm tracking-widest",
                (i === 0 || i === 6) ? "text-gray-400" : "text-shine-dark"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, i) => {
            const dayEvents = filteredEvents.filter(e => isSameDay(e.expiryDate, day));
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "min-h-[140px] p-2 border-r border-b border-gray-100 transition-colors group relative",
                  !isCurrentMonth && "bg-shine-bg/50",
                  (i % 7 === 6) && "border-r-0",
                  "hover:bg-shine-light/30"
                )}
              >
                {/* Day Number */}
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className={cn(
                    "text-sm font-serif font-black",
                    isCurrentMonth ? "text-shine-dark" : "text-gray-300",
                    isToday(day) && "w-7 h-7 flex items-center justify-center bg-vivid-orange text-white rounded-full font-black shadow-lg scale-110"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1 overflow-y-auto max-h-[100px] no-scrollbar">
                  {dayEvents.map(event => {
                    const daysToExpiry = differenceInDays(event.expiryDate, new Date());
                    const isWarning = daysToExpiry <= 30;

                    return (
                      <motion.button
                        key={event.id}
                        layoutId={event.id}
                        onClick={() => setSelectedEvent(event)}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-lg text-[10px] sm:text-xs flex flex-col gap-0.5 border shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
                          isWarning 
                            ? "bg-shine-accent border-shine-red/30 text-shine-red shadow-shine-red/10" 
                            : "bg-emerald-50 border-emerald-500/20 text-emerald-700"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1 font-black truncate">
                          <span className="truncate">{event.licenseName}</span>
                          {isWarning && <AlertCircle size={10} className="shrink-0 text-vivid-orange" />}
                        </div>
                        <div className="flex items-center justify-between text-[8px] sm:text-[10px] opacity-80 font-bold">
                          <span>{event.name}</span>
                          <span className="truncate ml-1">• {event.project.replace('專案', '')}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

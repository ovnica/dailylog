import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { JournalEntry } from '../types/journal';
import { getTodayDateString, getYesterdayDateString } from '../utils/dateUtils';

interface VisualCalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  allEntries: JournalEntry[];
  onClose?: () => void;
}

export const VisualCalendarPicker: React.FC<VisualCalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  allEntries,
  onClose,
}) => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const parseDateOrDefault = (str?: string) => {
    if (!str) return new Date();
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  };

  const initialDate = parseDateOrDefault(selectedDate || todayStr);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-11

  // Count entries per date
  const entryCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    allEntries.forEach((entry) => {
      map.set(entry.date, (map.get(entry.date) || 0) + 1);
    });
    return map;
  }, [allEntries]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Days in current view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // First day of week for current month (0 is Sun, 1 is Mon)
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Convert to Mon=0 ... Sun=6

  // Days in previous month to fill leading blanks
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const fullDate = `${viewYear}-${mStr}-${dStr}`;
    onSelectDate(fullDate);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3.5 w-full max-w-xs sm:max-w-sm select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {monthNames[viewMonth]} {viewYear}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            title="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-slate-400">
        {dayHeaders.map((dh, i) => (
          <div key={i} className="py-1">
            {dh}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Previous month leading days */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => {
          const prevDay = prevMonthDays - firstDayOfWeek + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="py-1.5 text-center text-slate-300 text-[11px] select-none"
            >
              {prevDay}
            </div>
          );
        })}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const mStr = String(viewMonth + 1).padStart(2, '0');
          const dStr = String(day).padStart(2, '0');
          const dateStr = `${viewYear}-${mStr}-${dStr}`;

          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const hasActivities = entryCountMap.has(dateStr);
          const activityCount = entryCountMap.get(dateStr) || 0;

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`relative py-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : isToday
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <span>{day}</span>

              {/* Indicator dot for days with activities */}
              {hasActivities && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-white' : 'bg-blue-500'
                  }`}
                  title={`${activityCount} aktivitas tercatat`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Jump Buttons Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
              onSelectDate(todayStr);
              if (onClose) onClose();
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => {
              const prev = new Date();
              prev.setDate(prev.getDate() - 1);
              setViewYear(prev.getFullYear());
              setViewMonth(prev.getMonth());
              onSelectDate(yesterdayStr);
              if (onClose) onClose();
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
          >
            Kemarin
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
};

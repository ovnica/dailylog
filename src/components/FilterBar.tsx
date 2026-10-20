import React, { useState } from 'react';
import { Search, X, RotateCcw, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EntryStatus, FilterOptions, JournalEntry } from '../types/journal';
import { VisualCalendarPicker } from './VisualCalendarPicker';
import {
  getTodayDateString,
  getYesterdayDateString,
  getWeekRange,
  formatIndonesianDate,
} from '../utils/dateUtils';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  allEntries: JournalEntry[];
  totalFilteredCount: number;
}

const STATUSES: EntryStatus[] = [
  'In Progress',
  'Completed',
  'Pending Review',
  'Approved by Principal',
  'Blocked / Postponed',
  'Not Started',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  allEntries,
  totalFilteredCount,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  const defaultCurrentWeek = getWeekRange(new Date(), 0);
  const lastWeek = getWeekRange(new Date(), -1);
  const activeWeek = getWeekRange(new Date(), filters.weekOffset || 0);

  // Quick activity counts for previewing in selectors
  const currentWeekEntriesCount = allEntries.filter(
    (e) => e.date >= defaultCurrentWeek.start && e.date <= defaultCurrentWeek.end
  ).length;
  const lastWeekEntriesCount = allEntries.filter(
    (e) => e.date >= lastWeek.start && e.date <= lastWeek.end
  ).length;

  const handleReset = () => {
    setIsCalendarOpen(false);
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      selectedSpecificDate: undefined,
      weekOffset: 0,
      followUpFilter: 'all',
    });
  };

  const handleDateRangeChange = (value: FilterOptions['dateRange']) => {
    if (value === 'custom_date') {
      setIsCalendarOpen(true);
      setFilters((prev) => ({
        ...prev,
        dateRange: value,
        selectedSpecificDate: prev.selectedSpecificDate || todayStr,
      }));
    } else if (value === 'this_week') {
      setIsCalendarOpen(false);
      setFilters((prev) => ({
        ...prev,
        dateRange: value,
        weekOffset: 0, // current week
      }));
    } else if (value === 'last_week') {
      setIsCalendarOpen(false);
      setFilters((prev) => ({
        ...prev,
        dateRange: value,
        weekOffset: -1, // previous week
      }));
    } else {
      setIsCalendarOpen(false);
      setFilters((prev) => ({
        ...prev,
        dateRange: value,
      }));
    }
  };

  const handleSelectSpecificDate = (dateStr: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: 'custom_date',
      selectedSpecificDate: dateStr,
    }));
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.dateRange !== 'all' ||
    (filters.weekOffset && filters.weekOffset !== 0) ||
    filters.followUpFilter !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5 relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search activities or follow-up plans..."
            className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Record / Date Selector: all records, this week, today, yesterday, atau pilih tanggal */}
        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as FilterOptions['dateRange'])}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-semibold cursor-pointer"
          >
            <option value="all">Record: Semua Aktivitas ({allEntries.length} Catatan)</option>
            <option value="this_week">
              Pekan Ini ({defaultCurrentWeek.label}) {currentWeekEntriesCount > 0 ? `(${currentWeekEntriesCount})` : ''}
            </option>
            <option value="last_week">
              Pekan Lalu ({lastWeek.label}) {lastWeekEntriesCount > 0 ? `(${lastWeekEntriesCount} aktivitas)` : ''}
            </option>
            <option value="today">
              Hari Ini ({formatIndonesianDate(todayStr)})
            </option>
            <option value="yesterday">
              Kemarin ({formatIndonesianDate(yesterdayStr)})
            </option>
            <option value="custom_date">Pilih Tanggal (Kalender)...</option>
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 cursor-pointer"
          >
            <option value="all">Status: All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Week Banner when "this_week" or "last_week" is selected */}
      {(filters.dateRange === 'this_week' || filters.dateRange === 'last_week') && (
        <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-lg text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-md shadow-2xs">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                  <span>Rentang Minggu:</span>
                  <strong className="text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                    {activeWeek.fullLabel}
                  </strong>
                  {(filters.weekOffset || 0) === 0 ? (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Minggu Berjalan
                    </span>
                  ) : (filters.weekOffset || 0) === -1 ? (
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                      Pekan Lalu (Terbaru)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {(filters.weekOffset || 0) < 0
                        ? `${Math.abs(filters.weekOffset || 0)} minggu lalu`
                        : `${filters.weekOffset} minggu depan`}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-blue-700/80">
                  Ditemukan <strong>{totalFilteredCount}</strong> aktivitas pada minggu ini
                </div>
              </div>
            </div>

            {/* Week navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    weekOffset: (prev.weekOffset || 0) - 1,
                  }))
                }
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Lihat minggu sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Minggu Sebelumnya</span>
              </button>

              {(filters.weekOffset || 0) !== 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: 'this_week',
                      weekOffset: 0,
                    }))
                  }
                  className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
                >
                  Ke Minggu Ini
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    weekOffset: (prev.weekOffset || 0) + 1,
                  }))
                }
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title="Lihat minggu berikutnya"
              >
                <span>Minggu Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prompt if current viewed week is empty but last week has entries */}
          {totalFilteredCount === 0 && lastWeekEntriesCount > 0 && (filters.weekOffset || 0) === 0 && (
            <div className="pt-1.5 border-t border-blue-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-700">
                Belum ada aktivitas di minggu berjalan ini ({defaultCurrentWeek.label}). Catatan Anda tersimpan di pekan lalu ({lastWeek.label}).
              </span>
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: 'last_week',
                    weekOffset: -1,
                  }))
                }
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <span>Buka Pekan Lalu ({lastWeek.label})</span>
                <span className="bg-blue-800 text-[10px] px-1.5 py-0.2 rounded-full">{lastWeekEntriesCount}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Banner / Controller for "Pilih Tanggal" */}
      {filters.dateRange === 'custom_date' && (
        <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-md shadow-2xs">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                  <span>Tanggal Terpilih:</span>
                  <strong className="text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                    {formatIndonesianDate(filters.selectedSpecificDate, true)}
                  </strong>
                </div>
                <div className="text-[11px] text-blue-700/80">
                  {totalFilteredCount} aktivitas tercatat pada tanggal ini
                </div>
              </div>
            </div>

            {/* Toggle Calendar button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isCalendarOpen
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white hover:bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isCalendarOpen ? 'Tutup Kalender' : 'Buka Tampilan Kalender'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Visual Interactive Calendar View */}
          {isCalendarOpen && (
            <div className="pt-2 flex justify-center sm:justify-start">
              <VisualCalendarPicker
                selectedDate={filters.selectedSpecificDate || todayStr}
                onSelectDate={handleSelectSpecificDate}
                allEntries={allEntries}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Sub-bar with quick toggle for follow-ups, reset, and counts */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                followUpFilter:
                  prev.followUpFilter === 'pending_followup' ? 'all' : 'pending_followup',
              }))
            }
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors border cursor-pointer ${
              filters.followUpFilter === 'pending_followup'
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🔔 Follow-ups Only
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{totalFilteredCount}</strong> of{' '}
          {allEntries.length} entries
        </div>
      </div>
    </div>
  );
};

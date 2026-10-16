import React from 'react';
import { Search, X, RotateCcw, Calendar, CheckSquare } from 'lucide-react';
import { EntryStatus, FilterOptions, JournalEntry } from '../types/journal';

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
  const handleReset = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      selectedSpecificDate: undefined,
      followUpFilter: 'all',
    });
  };

  const handleDateRangeChange = (value: FilterOptions['dateRange']) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: value,
      // Default to today's date if switching to custom_date and none selected yet
      selectedSpecificDate:
        value === 'custom_date' ? prev.selectedSpecificDate || '2026-10-15' : prev.selectedSpecificDate,
    }));
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.followUpFilter !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
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
        <div>
          <select
            value={filters.dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as FilterOptions['dateRange'])}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium cursor-pointer"
          >
            <option value="all">Record: All Records</option>
            <option value="this_week">This Week</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="custom_date">Pilih Tanggal...</option>
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

      {/* When "Pilih Tanggal" is active, display the interactive date picker input */}
      {filters.dateRange === 'custom_date' && (
        <div className="flex items-center gap-2 p-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs animate-in fade-in duration-150">
          <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="font-semibold text-blue-900">Pilih Tanggal:</span>
          <input
            type="date"
            value={filters.selectedSpecificDate || '2026-10-15'}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                selectedSpecificDate: e.target.value,
              }))
            }
            className="px-2.5 py-1 bg-white border border-blue-300 rounded text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          />
          {filters.selectedSpecificDate && (
            <span className="text-[11px] text-blue-800 font-medium">
              Menampilkan entri untuk: <strong>{filters.selectedSpecificDate}</strong>
            </span>
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

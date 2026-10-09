import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  ShieldCheck,
  CheckSquare,
  ListTodo,
  Layers
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types/journal';
import { calculateWeeklyStats, WeeklyStats } from '../utils/analytics';

interface DashboardProps {
  entries: JournalEntry[];
  currentUser: UserProfile;
  selectedWeekOffset: number;
  setSelectedWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  onFilterStatus?: (status: string) => void;
  onToggleFollowupDone: (entryId: string) => void;
  onQuickApprove?: (entryId: string) => void;
}

export const DashboardAnalytics: React.FC<DashboardProps> = ({
  entries,
  currentUser,
  selectedWeekOffset,
  setSelectedWeekOffset,
  onFilterStatus,
  onToggleFollowupDone,
  onQuickApprove,
}) => {
  const weeklyStats: WeeklyStats = calculateWeeklyStats(entries, selectedWeekOffset, '2026-10-08');

  // Overall statistics
  const allCompleted = entries.filter((e) => e.status === 'Completed' || e.progressPercent === 100).length;
  const overallRate = entries.length > 0 ? Math.round((allCompleted / entries.length) * 100) : 0;
  const maxDayCount = Math.max(...weeklyStats.dailyActivities.map((d) => d.count), 4);

  // Active upcoming follow-ups
  const activeFollowups = entries
    .filter((e) => e.followUpPlan && !e.followUpDone)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Week Navigator & Scope Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Academic Week Evaluation
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {weeklyStats.weekLabel}
              {selectedWeekOffset === 0 && (
                <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Current Week
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Week Pager */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setSelectedWeekOffset((prev) => prev - 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Week</span>
          </button>
          {selectedWeekOffset !== 0 && (
            <button
              onClick={() => setSelectedWeekOffset(0)}
              className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              Current Week
            </button>
          )}
          <button
            onClick={() => setSelectedWeekOffset((prev) => prev + 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Next Week"
          >
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Weekly Completion Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completion Rate
            </span>
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {weeklyStats.completionRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({weeklyStats.completedEntries} / {weeklyStats.totalEntries} done)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weeklyStats.completionRate >= 80
                  ? 'bg-emerald-500'
                  : weeklyStats.completionRate >= 50
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(weeklyStats.completionRate, 100)}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Overall Term: {overallRate}%</span>
            <span className="text-blue-700 font-medium">Target: 80%</span>
          </div>
        </div>

        {/* Card 2: Total Workload Entries */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Activities Logged
            </span>
            <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
              <ListTodo className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {weeklyStats.totalEntries}
            </span>
            <span className="text-xs font-medium text-slate-500">this week</span>
          </div>

          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
            <span>In Progress: {weeklyStats.inProgressEntries}</span>
            <span className="text-slate-500">Total in Journal: {entries.length}</span>
          </div>
        </div>

        {/* Card 3: Principal Endorsement / Reviews */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Principal Review
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {weeklyStats.principalApprovedCount}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Approved by Sari
            </span>
          </div>

          <div className="text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              {weeklyStats.totalEntries - weeklyStats.principalApprovedCount} Pending review
            </span>
            <span className="text-slate-500">sari@lazuardi.sch.id</span>
          </div>
        </div>

        {/* Card 4: Follow-up & Planning Radar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Follow-up & Next Plan
            </span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {weeklyStats.pendingFollowupCount}
            </span>
            <span className="text-xs font-medium text-slate-500">Active Action Items</span>
          </div>

          <div className="text-[11px] flex items-center justify-between">
            {weeklyStats.overdueFollowupCount > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {weeklyStats.overdueFollowupCount} Overdue
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> All deadlines on track
              </span>
            )}
            <span className="text-slate-400">Term 1</span>
          </div>
        </div>
      </div>

      {/* Main Visualizer: Daily Workload Completion Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Daily Activity Completion (Monday – Sunday)
            </h3>
            <p className="text-xs text-slate-500">
              Recorded activities and completed deliverables for {weeklyStats.weekLabel}
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            Total Week Activities: {weeklyStats.totalEntries}
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 border-b border-slate-200 pb-2">
            {weeklyStats.dailyActivities.map((item, index) => {
              const heightPercentage = maxDayCount > 0 ? (item.count / maxDayCount) * 100 : 0;
              const isToday = item.date === '2026-10-08';

              return (
                <div key={index} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                    {item.completedCount}/{item.count} done
                  </div>

                  <div className="w-full max-w-[44px] bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        isToday
                          ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-300'
                          : item.count > 0
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${Math.max(heightPercentage, item.count > 0 ? 12 : 3)}%` }}
                      title={`${item.day} (${item.date}): ${item.count} activities (${item.completedCount} completed)`}
                    />
                  </div>

                  <div className="mt-2 text-center">
                    <div className={`text-xs font-bold ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                      {item.day}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.date.split('-')[2]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Current Day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Logged Activities
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-200"></span> No Activities
            </span>
          </div>
          <span>Academic goal: consistent daily reflection</span>
        </div>
      </div>

      {/* Follow-up / Planning Next Steps & Principal Guidance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Action Items & Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                Active Follow-ups & Next Plans
              </h3>
              <p className="text-xs text-slate-500">
                Action items needing attention from recent workload entries
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {activeFollowups.length} Open
            </span>
          </div>

          <div className="space-y-2.5">
            {activeFollowups.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                All follow-ups and next plans are marked completed! 🎉
              </div>
            ) : (
              activeFollowups.map((entry) => {
                const isOverdue = entry.followUpDeadline && entry.followUpDeadline < '2026-10-08';
                return (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {entry.title}
                        </div>
                        <div className="text-slate-600 mt-1 line-clamp-2">
                          👉 <strong className="text-slate-800">Plan:</strong> {entry.followUpPlan}
                        </div>
                        {entry.followUpDeadline && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                isOverdue
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Target: {entry.followUpDeadline}
                              {isOverdue && ' (Overdue)'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Logged: {entry.date}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onToggleFollowupDone(entry.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded cursor-pointer transition-colors shrink-0"
                        title="Mark follow-up completed"
                      >
                        ✓ Mark Done
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Principal Review & Academic Endorsement Digest */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  Principal Review & Academic Endorsement
                </h3>
                <p className="text-xs text-slate-500">
                  Direct supervisory feedback from Ibu Sari (sari@lazuardi.sch.id)
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                Principal Digest
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 mb-3 text-xs leading-relaxed text-slate-700">
              <div className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Weekly Academic Director Guidance:
              </div>
              "Excellent initiative on the Grade 8 practical inquiries and lesson plans this week, Ovnica. Please make sure the mid-semester assessment blueprint is finalized so the moderation committee can review."
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                — Ibu Sari, School Principal (sari@lazuardi.sch.id)
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Total Workload Logs:</span>
                <span className="font-bold text-slate-900">{entries.length} items</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Principal Endorsement Rate:</span>
                <span className="font-bold text-emerald-700">
                  {entries.length > 0
                    ? Math.round((entries.filter((e) => e.principalApproved).length / entries.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Principal editor status: <strong className="text-slate-700">Active</strong>
            </span>
            {currentUser.id !== 'sari' ? (
              <span className="text-[11px] text-blue-600">
                Switch identity in top bar to test Principal approval actions
              </span>
            ) : (
              <span className="text-[11px] text-emerald-700 font-semibold">
                Logged in as Principal Sari
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

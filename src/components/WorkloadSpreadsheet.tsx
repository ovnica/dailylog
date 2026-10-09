import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowUpDown,
  ShieldCheck,
  CheckSquare,
  Layers
} from 'lucide-react';
import { JournalEntry, UserProfile, EntryStatus } from '../types/journal';
import { getSmartProgressSummary } from '../utils/analytics';

interface SpreadsheetProps {
  entries: JournalEntry[];
  currentUser: UserProfile;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onQuickUpdateStatus: (id: string, status: EntryStatus, progress: number) => void;
  onToggleFollowupDone: (id: string) => void;
  onPrincipalApprove: (id: string, feedback?: string) => void;
}

type SortField = 'date' | 'title' | 'progressPercent' | 'status';
type SortOrder = 'asc' | 'desc';

export const WorkloadSpreadsheet: React.FC<SpreadsheetProps> = ({
  entries,
  currentUser,
  onEditEntry,
  onDeleteEntry,
  onQuickUpdateStatus,
  onToggleFollowupDone,
  onPrincipalApprove,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');
  const [principalCommentPromptId, setPrincipalCommentPromptId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'progressPercent') {
        comparison = a.progressPercent - b.progressPercent;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [entries, sortField, sortOrder]);

  const getStatusBadge = (status: EntryStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Approved by Principal':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Blocked / Postponed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const submitPrincipalReview = (id: string) => {
    onPrincipalApprove(id, tempComment.trim());
    setPrincipalCommentPromptId(null);
    setTempComment('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Activity Ledger
          </span>
          <span className="text-xs text-slate-500 font-medium">
            ({sortedEntries.length} entries displayed)
          </span>
        </div>

        {/* Responsive view layout toggle (handy for tablets / phones) */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">Layout:</span>
          <div className="flex bg-white rounded-md border border-slate-200 p-0.5">
            <button
              onClick={() => setViewLayout('table')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium cursor-pointer ${
                viewLayout === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spreadsheet
            </button>
            <button
              onClick={() => setViewLayout('cards')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium cursor-pointer ${
                viewLayout === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No journal entries found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or log a new activity.</p>
        </div>
      ) : viewLayout === 'cards' ? (
        /* Card / Tablet Optimized Grid View */
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedEntries.map((entry) => {
            const summary = getSmartProgressSummary(entry);
            const isOverdue =
              entry.followUpDeadline && entry.followUpDeadline < '2026-10-08' && !entry.followUpDone;

            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      {entry.id} • {entry.date}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusBadge(
                        entry.status
                      )}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                    {entry.title}
                  </h3>
                  {entry.description && (
                    <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                      {entry.description}
                    </p>
                  )}

                  {/* Automated progress summary badge */}
                  <div
                    className={`inline-block text-[10px] px-2 py-0.5 rounded border mb-3 ${summary.badgeClass}`}
                  >
                    {summary.label}
                  </div>

                  {/* Follow up box */}
                  {entry.followUpPlan && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-0.5">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-amber-700" />
                          Follow-up / Next Plan:
                        </span>
                        {entry.followUpDeadline && (
                          <span className={isOverdue ? 'text-rose-700 font-bold' : 'text-amber-800'}>
                            Due: {entry.followUpDeadline}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 text-xs">{entry.followUpPlan}</p>
                    </div>
                  )}

                  {/* Principal feedback */}
                  {entry.principalFeedback && (
                    <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-2.5 mb-3 text-xs">
                      <div className="text-[11px] font-semibold text-indigo-900 mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-700" />
                        Principal Feedback ({entry.principalApproved ? 'Approved' : 'Note'}):
                      </div>
                      <p className="text-slate-700 text-xs italic">"{entry.principalFeedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <span>Progress: {entry.progressPercent}%</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentUser.canApprove && !entry.principalApproved && (
                      <button
                        onClick={() => onPrincipalApprove(entry.id)}
                        className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer"
                      >
                        ✓ Endorse
                      </button>
                    )}
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                      title="Edit activity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Spreadsheet Tabular View (Clean: No category, tags, time) */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 select-none">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-28 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors min-w-[280px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Activity & Workload Details</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('progressPercent')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-48 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Status & Progress</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[240px]">Follow-up / Planning Next</th>
                <th className="py-3 px-3 min-w-[210px]">Principal Review (Ibu Sari)</th>
                <th className="py-3 px-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedEntries.map((entry) => {
                const summary = getSmartProgressSummary(entry);
                const isOverdue =
                  entry.followUpDeadline &&
                  entry.followUpDeadline < '2026-10-08' &&
                  !entry.followUpDone;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-blue-50/40 transition-colors group text-slate-800"
                  >
                    {/* Date Column */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{entry.date}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{entry.id}</div>
                    </td>

                    {/* Workload Activity Details */}
                    <td className="py-3 px-3 align-top">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {entry.title}
                      </div>
                      {entry.description && (
                        <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                          {entry.description}
                        </p>
                      )}
                    </td>

                    {/* Status & Automated Progress Summary */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">
                          {entry.progressPercent}%
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            entry.progressPercent === 100
                              ? 'bg-emerald-500'
                              : entry.progressPercent > 50
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${entry.progressPercent}%` }}
                        />
                      </div>

                      {/* Automated Progress Summary Badge */}
                      <div
                        className={`text-[10px] px-1.5 py-0.5 rounded border leading-tight ${summary.badgeClass}`}
                        title="Automated status evaluation"
                      >
                        {summary.label}
                      </div>
                    </td>

                    {/* Follow-up / Planning for Next Column */}
                    <td className="py-3 px-3 align-top">
                      {entry.followUpPlan ? (
                        <div
                          className={`p-2 rounded-lg border text-[11px] ${
                            entry.followUpDone
                              ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                              : isOverdue
                              ? 'bg-rose-50 border-rose-200 text-slate-800'
                              : 'bg-amber-50/60 border-amber-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-semibold text-slate-900 flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-amber-700" />
                              Next Action:
                            </span>
                            <button
                              onClick={() => onToggleFollowupDone(entry.id)}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                entry.followUpDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                              }`}
                              title={entry.followUpDone ? 'Mark as active' : 'Mark as completed'}
                            >
                              {entry.followUpDone ? '✓ Done' : 'Complete'}
                            </button>
                          </div>
                          <div className="leading-relaxed">{entry.followUpPlan}</div>
                          {entry.followUpDeadline && (
                            <div className="mt-1 text-[10px] flex items-center gap-1 text-slate-500 font-medium">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>Target: {entry.followUpDeadline}</span>
                              {isOverdue && (
                                <span className="text-rose-600 font-bold">(Overdue!)</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No follow-up logged</span>
                      )}
                    </td>

                    {/* Principal Review & Endorsement Column */}
                    <td className="py-3 px-3 align-top">
                      {entry.principalApproved ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px]">
                          <div className="flex items-center gap-1 font-bold text-emerald-800 mb-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved by Principal</span>
                          </div>
                          {entry.principalFeedback && (
                            <p className="text-emerald-900 italic text-[11px] leading-relaxed">
                              "{entry.principalFeedback}"
                            </p>
                          )}
                        </div>
                      ) : entry.principalFeedback ? (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-[11px]">
                          <div className="font-semibold text-indigo-900 mb-0.5">
                            Principal Note:
                          </div>
                          <p className="text-slate-700 italic text-[11px]">
                            "{entry.principalFeedback}"
                          </p>
                          {currentUser.canApprove && (
                            <button
                              onClick={() => onPrincipalApprove(entry.id)}
                              className="mt-1 text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                            >
                              ✓ Grant Official Approval
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] text-slate-400">Awaiting endorsement</span>
                          {currentUser.canApprove && (
                            <div className="mt-1">
                              {principalCommentPromptId === entry.id ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={tempComment}
                                    onChange={(e) => setTempComment(e.target.value)}
                                    placeholder="Add feedback comment..."
                                    className="w-full text-[11px] p-1 bg-white border border-slate-300 rounded"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => submitPrincipalReview(entry.id)}
                                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Approve & Sign
                                    </button>
                                    <button
                                      onClick={() => setPrincipalCommentPromptId(null)}
                                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => onPrincipalApprove(entry.id)}
                                    className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                                  >
                                    ✓ Quick Endorse
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPrincipalCommentPromptId(entry.id);
                                      setTempComment('');
                                    }}
                                    className="px-1.5 py-0.5 text-[10px] text-slate-600 hover:text-slate-900 border border-slate-200 rounded cursor-pointer"
                                    title="Add feedback note"
                                  >
                                    + Note
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-3 align-top text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditEntry(entry)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit activity entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  EntryStatus,
  JournalEntry,
  PriorityLevel,
  UserProfile,
} from '../types/journal';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  editingEntry?: JournalEntry | null;
  currentUser: UserProfile;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-08');
  const [status, setStatus] = useState<EntryStatus>('In Progress');
  const [progressPercent, setProgressPercent] = useState(50);
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [followUpDeadline, setFollowUpDeadline] = useState('');
  const [followUpDone, setFollowUpDone] = useState(false);
  const [principalFeedback, setPrincipalFeedback] = useState('');
  const [principalApproved, setPrincipalApproved] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setDescription(editingEntry.description || '');
      setDate(editingEntry.date);
      setStatus(editingEntry.status);
      setProgressPercent(editingEntry.progressPercent ?? 50);
      setPriority(editingEntry.priority || 'Normal');
      setFollowUpPlan(editingEntry.followUpPlan || '');
      setFollowUpDeadline(editingEntry.followUpDeadline || '');
      setFollowUpDone(editingEntry.followUpDone || false);
      setPrincipalFeedback(editingEntry.principalFeedback || '');
      setPrincipalApproved(editingEntry.principalApproved || false);
    } else {
      // Defaults for new entry
      setTitle('');
      setDescription('');
      setDate('2026-10-08');
      setStatus('Completed');
      setProgressPercent(100);
      setPriority('Normal');
      setFollowUpPlan('');
      setFollowUpDeadline('');
      setFollowUpDone(false);
      setPrincipalFeedback('');
      setPrincipalApproved(false);
    }
  }, [editingEntry, isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus: EntryStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed' || newStatus === 'Approved by Principal') {
      setProgressPercent(100);
    } else if (newStatus === 'Not Started') {
      setProgressPercent(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const entryToSave: JournalEntry = {
      id: editingEntry ? editingEntry.id : `LZ-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      date,
      title: title.trim(),
      description: description.trim(),
      status,
      progressPercent: Number(progressPercent) || 0,
      followUpPlan: followUpPlan.trim(),
      followUpDeadline: followUpDeadline || undefined,
      followUpDone,
      priority,
      principalFeedback: principalFeedback.trim() || undefined,
      principalApproved: Boolean(principalApproved),
      principalApprovedAt: principalApproved
        ? editingEntry?.principalApprovedAt || new Date().toISOString()
        : undefined,
      createdAt: editingEntry ? editingEntry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(entryToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Lazuardi Faculty Journal Ledger
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {editingEntry ? 'Edit Workload Activity' : 'Log New Workload Activity'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Workload Activity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cambridge Science Lab Preparation & Microscope Calibration"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Date and Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date Completed / Logged
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Activity Details & Outcomes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain outcomes, students involved, materials prepared, or meeting minutes..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Status & Automated Progress Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Execution Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as EntryStatus)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved by Principal">Approved by Principal</option>
                <option value="Blocked / Postponed">Blocked / Postponed</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Progress Completion</label>
                <span className="font-bold text-blue-700">{progressPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressPercent}
                onChange={(e) => setProgressPercent(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Follow-up / Planning for Next Section */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Follow-up & Planning for Next Steps
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={followUpDone}
                  onChange={(e) => setFollowUpDone(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-[11px] font-semibold">Mark Follow-up Completed</span>
              </label>
            </div>

            <div>
              <textarea
                rows={2}
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                placeholder="e.g. Review student lab reports next Monday, prepare review questions with Ibu Sari..."
                className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-slate-900 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-[11px] text-slate-600 font-medium">Follow-up Target Deadline:</span>
              <input
                type="date"
                value={followUpDeadline}
                onChange={(e) => setFollowUpDeadline(e.target.value)}
                className="px-2.5 py-1 bg-white border border-amber-200 rounded text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Principal Review & Approval Section */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                Principal Endorsement & Review (Ibu Sari - sari@lazuardi.sch.id)
              </span>
              {currentUser.canApprove ? (
                <label className="flex items-center gap-1.5 cursor-pointer text-indigo-900">
                  <input
                    type="checkbox"
                    checked={principalApproved}
                    onChange={(e) => {
                      setPrincipalApproved(e.target.checked);
                      if (e.target.checked && status !== 'Completed') {
                        setStatus('Approved by Principal');
                        setProgressPercent(100);
                      }
                    }}
                    className="rounded text-indigo-600 accent-indigo-600"
                  />
                  <span className="text-[11px] font-bold">Principal Approved ✓</span>
                </label>
              ) : (
                <span className="text-[11px] font-semibold text-slate-500">
                  {principalApproved ? '✓ Official Principal Approval Granted' : 'Pending Principal Review'}
                </span>
              )}
            </div>

            <textarea
              rows={2}
              value={principalFeedback}
              onChange={(e) => setPrincipalFeedback(e.target.value)}
              disabled={!currentUser.canApprove && !currentUser.canEdit}
              placeholder={
                currentUser.canApprove
                  ? 'Enter principal guidance, praise, or pedagogical notes for Ovnica...'
                  : 'Principal feedback notes will appear here...'
              }
              className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingEntry ? 'Save Changes' : 'Record Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

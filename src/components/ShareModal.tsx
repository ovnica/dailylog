import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  Globe,
  Send
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types/journal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  currentUser: UserProfile;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareableUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Compute summary for email
  const totalEntries = entries.length;
  const completed = entries.filter((e) => e.status === 'Completed' || e.progressPercent === 100).length;
  const pendingFollowups = entries.filter((e) => e.followUpPlan && !e.followUpDone).length;
  const completionRate = totalEntries > 0 ? Math.round((completed / totalEntries) * 100) : 0;

  const emailSubject = encodeURIComponent(
    `[Lazuardi Faculty Log] Workload Journal & Weekly Completion Summary - Ovnica`
  );
  const emailBody = encodeURIComponent(
    `Assalamu'alaikum Ibu Sari,\n\nHere is the updated faculty workload journal summary for the current academic period:\n\n• Total Activities Recorded: ${totalEntries}\n• Completion Rate: ${completionRate}%\n• Active Follow-up Plans: ${pendingFollowups} pending items\n\nYou can access, edit, and endorse the live journal entries directly at:\n${shareableUrl}\n\nWassalam,\nOvnica (ovnica@lazuardi.sch.id)\nFaculty Member & Science Lead\nLazuardi Islamic Global School`
  );

  const handleSendSimulatedEmail = () => {
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('sent');
      setTimeout(() => setEmailStatus(null), 4000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share & Sync Access</h2>
              <p className="text-xs text-slate-500">Collaborate with Principal Sari & Lazuardi faculty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Link Sharing Box */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Public Link Access (Anyone with the link can access)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-all font-mono text-[11px]"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Anyone with this URL can view the live journal and switch roles to inspect or review.
            </p>
          </div>

          {/* User Access Roles */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
              Designated Lazuardi Accounts & Permissions
            </h3>

            <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {/* Ovnica */}
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    OV
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Ovnica (You)</div>
                    <div className="text-[11px] text-slate-500 font-mono">ovnica@lazuardi.sch.id</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Author & Owner
                </span>
              </div>

              {/* Sari */}
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-[10px]">
                    SR
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Ibu Sari (Principal)</div>
                    <div className="text-[11px] text-slate-500 font-mono">sari@lazuardi.sch.id</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                  Principal Editor & Approver
                </span>
              </div>
            </div>
          </div>

          {/* Email Notification & Dispatch */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-700" />
                Sync via Lazuardi Email Notification
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                Digest Sync
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dispatch a direct summary of your logged activities ({totalEntries} activities, {completionRate}% complete),
              and planned follow-ups to <strong>sari@lazuardi.sch.id</strong> and{' '}
              <strong>ovnica@lazuardi.sch.id</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`mailto:sari@lazuardi.sch.id,ovnica@lazuardi.sch.id?subject=${emailSubject}&body=${emailBody}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Mail Client</span>
              </a>

              <button
                onClick={handleSendSimulatedEmail}
                disabled={emailStatus === 'sending'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                <span>{emailStatus === 'sending' ? 'Sending...' : emailStatus === 'sent' ? '✓ Dispatched to School Mail!' : 'Send Direct Sync Notification'}</span>
              </button>
            </div>

            {emailStatus === 'sent' && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Digest notification synchronized to sari@lazuardi.sch.id and ovnica@lazuardi.sch.id!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

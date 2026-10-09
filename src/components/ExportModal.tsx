import React, { useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types/journal';
import { exportWorkloadReportPDF, exportWorkloadCSV } from '../utils/pdfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  currentUser: UserProfile;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentUser,
}) => {
  const [reportScope, setReportScope] = useState<'all' | 'this_week' | 'this_month'>('all');
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Filter entries based on selected scope
  const filteredEntries = entries.filter((entry) => {
    if (reportScope === 'this_week') {
      return entry.date >= '2026-10-05' && entry.date <= '2026-10-11';
    }
    if (reportScope === 'this_month') {
      return entry.date.startsWith('2026-10');
    }
    return true;
  });

  const completedCount = filteredEntries.filter(
    (e) => e.status === 'Completed' || e.progressPercent === 100
  ).length;
  const completionRate =
    filteredEntries.length > 0
      ? Math.round((completedCount / filteredEntries.length) * 100)
      : 0;

  const handleGeneratePDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportWorkloadReportPDF(filteredEntries, {
        teacherName: 'Ovnica',
        teacherEmail: 'ovnica@lazuardi.sch.id',
        principalName: 'Ibu Sari',
        principalEmail: 'sari@lazuardi.sch.id',
        dateRangeLabel:
          reportScope === 'this_week'
            ? 'Oct 5 – Oct 11, 2026 (Week 4 Evaluation)'
            : reportScope === 'this_month'
            ? 'October 2026 (Mid-Term Evaluation)'
            : 'Academic Term 1 (Complete Activity Ledger)',
      });
      setIsExporting(false);
      onClose();
    }, 400);
  };

  const handleExportCSV = () => {
    exportWorkloadCSV(filteredEntries);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export Workload Report</h2>
              <p className="text-xs text-slate-500">
                Official PDF & CSV reporting for Lazuardi Academic Administration
              </p>
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
        <div className="p-6 space-y-4 text-xs">
          {/* Scope Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Reporting Period Scope</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportScope('all')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  reportScope === 'all'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Full Ledger</div>
                <div className="text-[10px] text-slate-500">All recorded terms</div>
              </button>

              <button
                type="button"
                onClick={() => setReportScope('this_week')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  reportScope === 'this_week'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Current Week</div>
                <div className="text-[10px] text-slate-500">Oct 5 – Oct 11</div>
              </button>

              <button
                type="button"
                onClick={() => setReportScope('this_month')}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  reportScope === 'this_month'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">October 2026</div>
                <div className="text-[10px] text-slate-500">Monthly evaluation</div>
              </button>
            </div>
          </div>

          {/* Audit Metrics Preview Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Report Content Summary</span>
              <span className="text-blue-700">{filteredEntries.length} Activities</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-base font-extrabold text-slate-900">{filteredEntries.length}</div>
                <div className="text-[10px] text-slate-500">Activities</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-base font-extrabold text-slate-900">{completionRate}%</div>
                <div className="text-[10px] text-slate-500">Completion Rate</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-base font-extrabold text-emerald-600">
                  {filteredEntries.filter((e) => e.principalApproved).length}
                </div>
                <div className="text-[10px] text-slate-500">Approved by Sari</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-1 flex items-center justify-between border-t border-slate-200 mt-2">
              <span>
                Faculty: <strong>Ovnica</strong>
              </span>
              <span>
                Principal: <strong>Ibu Sari</strong>
              </span>
            </div>
          </div>

          {/* Report Options */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded text-blue-600 accent-blue-600"
              />
              <span className="text-xs font-medium">
                Include formal Teacher & Principal signature endorsement block
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1.5 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Browser Print</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              CSV Raw Data
            </button>
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={isExporting}
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BookOpen,
  Share2,
  FileDown,
  Plus,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Mail,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  LayoutDashboard,
  Table as TableIcon
} from 'lucide-react';
import { UserProfile } from '../types/journal';
import { USER_PROFILES } from '../utils/storage';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (userId: string) => void;
  onOpenNewModal: () => void;
  onOpenShareModal: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  activeTab: 'spreadsheet' | 'dashboard' | 'split';
  setActiveTab: (tab: 'spreadsheet' | 'dashboard' | 'split') => void;
  totalEntriesCount: number;
  syncTimestamp: string;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  onOpenNewModal,
  onOpenShareModal,
  onExportPDF,
  onExportCSV,
  activeTab,
  setActiveTab,
  totalEntriesCount,
  syncTimestamp,
  isSyncing,
  onTriggerSync,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Academic Banner */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium tracking-wide">LAZUARDI ISLAMIC GLOBAL SCHOOL</span>
          <span className="hidden sm:inline text-slate-400">| Faculty Academic Workload Portal</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTriggerSync}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Click to force cloud sync"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>Synced: {syncTimestamp}</span>
            </button>
          </div>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-300">Term 1 • Academic Year 2026/2027</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-sm font-bold text-lg tracking-wider">
              LZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Workload Journal & Activity Log
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold border border-blue-200">
                  {totalEntriesCount} Logs
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Spreadsheet tracking for</span>
                <strong className="text-slate-700 font-medium">ovnica@lazuardi.sch.id</strong>
                <span>• Principal review by</span>
                <strong className="text-slate-700 font-medium">sari@lazuardi.sch.id</strong>
              </p>
            </div>
          </div>

          {/* Action Tools & User Selector */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
              <button
                onClick={() => setActiveTab('spreadsheet')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
                  activeTab === 'spreadsheet'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
                title="Spreadsheet tabular view"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Spreadsheet</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
                title="Analytics and weekly completion rates"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
                  activeTab === 'split'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
                title="Split view (Dashboard + Spreadsheet)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
            </div>

            {/* Share / Access Link */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              title="Share link & manage access"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Share Link</span>
            </button>

            {/* Export Menu (PDF & CSV) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Report</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        onExportPDF();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-slate-800 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="font-semibold text-slate-900">Official PDF Report</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-medium">Download</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        onExportCSV();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Spreadsheet (.CSV)</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Raw Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}
                >
                  {currentUser.avatarInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {currentUser.id === 'sari' ? 'Principal (Editor)' : currentUser.id === 'ovnica' ? 'Teacher / Owner' : 'Viewer'}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Collaborative Identity Switcher
                    </div>
                    {Object.values(USER_PROFILES).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                          currentUser.id === user.id ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${user.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                            {user.name}
                            {currentUser.id === user.id && (
                              <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                          <div className="text-[10px] text-blue-600 font-medium">{user.roleTitle}</div>
                        </div>
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 leading-relaxed">
                      💡 Anyone with the link has access. Switch to <strong>Ibu Sari</strong> to test principal approvals & comments.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Primary Action Button: Add Entry */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

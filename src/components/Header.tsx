import React, { useState } from 'react';
import {
  Share2,
  FileDown,
  Plus,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Layers,
  LayoutDashboard,
  Table as TableIcon,
  ShieldCheck,
  UserPlus,
  Radio
} from 'lucide-react';
import { UserProfile } from '../types/journal';
import { USER_PROFILES, createUserProfileFromEmail } from '../utils/storage';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (userIdOrEmail: string, customName?: string) => void;
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
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const finalEmail = customEmail.includes('@')
      ? customEmail.trim()
      : `${customEmail.trim()}@lazuardi.sch.id`;
    onSwitchUser(finalEmail, customName.trim() || undefined);
    setCustomEmail('');
    setCustomName('');
    setShowCustomForm(false);
    setShowUserDropdown(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Academic Banner with Live Sync Status */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-[11px] sm:text-xs">
            LAZUARDI ISLAMIC GLOBAL SCHOOL
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-emerald-400 font-medium text-[11px] flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Cloud Firestore Real-time Sync Aktif (@lazuardi.sch.id)</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-slate-300 text-xs">
          <button
            onClick={onTriggerSync}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            title="Klik untuk menyinkronkan ulang data langsung dengan Firestore"
          >
            <RefreshCw
              className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-400' : 'text-emerald-400'}`}
            />
            <span>Sinkron: {syncTimestamp}</span>
          </button>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">
            Tahun Ajaran 2026/2027
          </span>
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
                  Activity Log
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold border border-blue-200">
                  {totalEntriesCount} Catatan
                </span>
                {currentUser.canApprove && (
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-semibold border border-indigo-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span>Akses Kepala Sekolah</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1 mt-0.5">
                <span>Akun Aktif:</span>
                <strong className="text-slate-800 font-semibold">{currentUser.name}</strong>
                <span className="text-slate-400">({currentUser.email})</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-700 font-medium">Terhubung ke Cloud Firestore</span>
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
                title="Tampilan Lembar Kerja / Spreadsheet"
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
                title="Ringkasan Analitik & Persentase Selesai"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analitik</span>
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${
                  activeTab === 'split'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
                title="Tampilan Ganda (Analitik + Spreadsheet)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
            </div>

            {/* Share / Access Link */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Bagikan Tautan ke Bu Sari atau Akun @lazuardi.sch.id"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Share Link</span>
            </button>

            {/* Export Menu (PDF & CSV) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
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
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-slate-800 flex items-center justify-between group cursor-pointer"
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
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
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

            {/* User Persona Switcher & @lazuardi.sch.id Account Selector */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
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
                    {currentUser.canApprove ? 'Kepala Sekolah (Approval)' : 'Guru / Lead Sains'}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <span>Pilih Akun @lazuardi.sch.id</span>
                      <span className="text-emerald-600 font-bold lowercase">realtime sync</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {Object.values(USER_PROFILES).map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            currentUser.email.toLowerCase() === user.email.toLowerCase()
                              ? 'bg-blue-50 text-blue-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full ${user.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                          >
                            {user.avatarInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                              {user.name}
                              {currentUser.email.toLowerCase() === user.email.toLowerCase() && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                            <div className="text-[10px] text-blue-600 font-medium">
                              {user.roleTitle}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Custom @lazuardi.sch.id Login Section */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/70">
                      {!showCustomForm ? (
                        <button
                          onClick={() => setShowCustomForm(true)}
                          className="w-full py-1.5 px-2.5 text-xs text-blue-700 font-medium bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Gunakan Akun @lazuardi.sch.id Lain</span>
                        </button>
                      ) : (
                        <form onSubmit={handleCustomLogin} className="space-y-2">
                          <div className="text-[11px] font-semibold text-slate-700">
                            Masuk dengan Email Lazuardi:
                          </div>
                          <input
                            type="text"
                            placeholder="Nama Lengkap (opsional)"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              required
                              placeholder="nama (atau nama@lazuardi.sch.id)"
                              value={customEmail}
                              onChange={(e) => setCustomEmail(e.target.value)}
                              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold cursor-pointer"
                            >
                              Masuk
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Otomatis terdaftar dengan hak akses kolaboratif real-time.
                          </div>
                        </form>
                      )}
                    </div>

                    <div className="px-3.5 py-2 border-t border-slate-100 bg-blue-50/50 text-[11px] text-slate-600 leading-relaxed">
                      💡 <strong>Sinkronisasi Instan:</strong> Setiap perubahan langsung disimpan ke
                      Cloud Firestore sehingga otomatis terlihat oleh Bu Sari (
                      <span className="text-blue-700 font-medium">sari@lazuardi.sch.id</span>) dan
                      seluruh rekan di domain <span className="font-medium">@lazuardi.sch.id</span>.
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

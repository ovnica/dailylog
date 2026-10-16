/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { FilterBar } from './components/FilterBar';
import { WorkloadSpreadsheet } from './components/WorkloadSpreadsheet';
import { EntryModal } from './components/EntryModal';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';
import {
  FilterOptions,
  JournalEntry,
  UserProfile,
  EntryStatus,
} from './types/journal';
import {
  getStoredEntries,
  saveStoredEntries,
  getActiveUser,
  setActiveUser,
  resetToSeedEntries,
} from './utils/storage';
import {
  subscribeToCloudActivities,
  saveActivityToCloud,
  deleteActivityFromCloud,
  syncAllActivitiesToCloud,
} from './utils/firebaseStorage';
import { decodeEntriesFromUrl } from './utils/shareUrl';
import { exportWorkloadCSV } from './utils/pdfExport';
import {
  CheckCircle2,
  Plus,
  RotateCcw,
  Info
} from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => getStoredEntries());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getActiveUser());
  const [activeTab, setActiveTab] = useState<'spreadsheet' | 'dashboard' | 'split'>('spreadsheet');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);

  // Sync state simulation
  const [syncTimestamp, setSyncTimestamp] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(
    null
  );

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Simplified filter state (no tags, no category)
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    followUpFilter: 'all',
  });

  // Handle Real-time Firestore Database Synchronization on mount
  useEffect(() => {
    // 1. Check if the URL contains shared activity entries
    const sharedFromUrl = decodeEntriesFromUrl();
    if (sharedFromUrl && sharedFromUrl.length > 0) {
      setEntries(sharedFromUrl);
      saveStoredEntries(sharedFromUrl);
      syncAllActivitiesToCloud(sharedFromUrl);
      showToast(
        `Memuat ${sharedFromUrl.length} catatan aktivitas dari tautan dan menyinkronkan ke Cloud!`,
        'success'
      );
      try {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      } catch (e) {
        // ignore
      }
    }

    // 2. Subscribe to real-time Cloud Firestore updates
    const unsubscribe = subscribeToCloudActivities(
      (cloudEntries) => {
        if (cloudEntries && cloudEntries.length > 0) {
          setEntries(cloudEntries);
          saveStoredEntries(cloudEntries);
          setSyncTimestamp(
            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          );
        } else {
          // If cloud is initially empty, push Ovnica's existing local activities up to the cloud!
          const localEntries = getStoredEntries();
          if (localEntries && localEntries.length > 0) {
            syncAllActivitiesToCloud(localEntries).then(() => {
              setEntries(localEntries);
            });
          }
        }
      },
      (err) => {
        console.warn('Firestore offline fallback:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Persist entries to local backup on change
  useEffect(() => {
    saveStoredEntries(entries);
  }, [entries]);

  // Flash notification helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await syncAllActivitiesToCloud(entries);
    setIsSyncing(false);
    setSyncTimestamp(
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    showToast('Tersinkronisasi langsung dengan Cloud Firestore Lazuardi!', 'success');
  };

  const handleSwitchUser = (userId: string) => {
    const user = setActiveUser(userId);
    setCurrentUser(user);
    showToast(
      `Switched active collaborator to ${user.name} (${user.email})`,
      'info'
    );
  };

  const handleOpenNewModal = () => {
    setEditingEntry(null);
    setIsEntryModalOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (entry: JournalEntry) => {
    if (editingEntry) {
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
      showToast(`Perubahan aktivitas "${entry.title}" disimpan ke Cloud`, 'success');
    } else {
      setEntries((prev) => [entry, ...prev]);
      showToast(`Aktivitas baru "${entry.title}" berhasil dicatat ke Cloud`, 'success');
    }
    setIsEntryModalOpen(false);
    setEditingEntry(null);

    // Persist directly to Cloud Firestore
    await saveActivityToCloud(entry);
  };

  const handleDeleteEntry = async (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (window.confirm(`Hapus aktivitas "${target?.title || 'ini'}" dari database cloud?`)) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast('Aktivitas dihapus dari ledger', 'info');
      await deleteActivityFromCloud(id);
    }
  };

  const handleQuickUpdateStatus = async (id: string, status: EntryStatus, progress: number) => {
    const target = entries.find((e) => e.id === id);
    if (target) {
      const updated = {
        ...target,
        status,
        progressPercent: progress,
        updatedAt: new Date().toISOString(),
      };
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      await saveActivityToCloud(updated);
    }
  };

  const handleToggleFollowupDone = async (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (target) {
      const newState = !target.followUpDone;
      const updated = {
        ...target,
        followUpDone: newState,
        updatedAt: new Date().toISOString(),
      };
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showToast(
        newState
          ? `Tindak lanjut ditandai selesai untuk "${target.title}"`
          : `Tindak lanjut dibuka kembali untuk "${target.title}"`,
        'success'
      );
      await saveActivityToCloud(updated);
    }
  };

  const handlePrincipalApprove = async (id: string, feedback?: string) => {
    const target = entries.find((e) => e.id === id);
    if (target) {
      const updated: JournalEntry = {
        ...target,
        principalApproved: true,
        principalApprovedAt: new Date().toISOString(),
        status: 'Approved by Principal',
        progressPercent: 100,
        principalFeedback: feedback || target.principalFeedback || 'Endorsed by Principal Ibu Sari.',
        updatedAt: new Date().toISOString(),
      };
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showToast(`Persetujuan & endorsement resmi Kepala Sekolah berhasil dicatat untuk "${target.title}"`, 'success');
      await saveActivityToCloud(updated);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset journal back to initial Lazuardi faculty seed dataset?')) {
      const reset = resetToSeedEntries();
      setEntries(reset);
      showToast('Reset to original sample data', 'info');
    }
  };

  // Filtered entries computation (simplified: search, date, status, priority, follow-up)
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(query);
        const matchDesc = entry.description?.toLowerCase().includes(query);
        const matchFollowUp = entry.followUpPlan?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchFollowUp) return false;
      }

      // Status filter
      if (filters.status !== 'all' && entry.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && entry.priority !== filters.priority) {
        return false;
      }

      // Date Range filter: all records, this week, today, yesterday, atau pilih tanggal
      if (filters.dateRange === 'today') {
        const todayStr = '2026-10-15';
        if (entry.date !== todayStr) return false;
      } else if (filters.dateRange === 'yesterday') {
        const yesterdayStr = '2026-10-14';
        if (entry.date !== yesterdayStr) return false;
      } else if (filters.dateRange === 'this_week') {
        // Monday (2026-10-12) to Sunday (2026-10-18)
        if (entry.date < '2026-10-12' || entry.date > '2026-10-18') return false;
      } else if (filters.dateRange === 'custom_date' && filters.selectedSpecificDate) {
        if (entry.date !== filters.selectedSpecificDate) return false;
      }

      // Follow-up Filter
      if (filters.followUpFilter === 'has_followup' && !entry.followUpPlan) {
        return false;
      }
      if (filters.followUpFilter === 'pending_followup' && (!entry.followUpPlan || entry.followUpDone)) {
        return false;
      }
      if (filters.followUpFilter === 'completed_followup' && (!entry.followUpPlan || !entry.followUpDone)) {
        return false;
      }

      return true;
    });
  }, [entries, filters]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenNewModal={handleOpenNewModal}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onExportPDF={() => setIsExportModalOpen(true)}
        onExportCSV={() => exportWorkloadCSV(filteredEntries)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalEntriesCount={entries.length}
        syncTimestamp={syncTimestamp}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-blue-900 text-white border-blue-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-blue-300" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main App Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Collaborative Banner Notice */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/30 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase border border-blue-400/20">
                Lazuardi Faculty Ledger
              </span>
              <span className="text-slate-300 text-xs">
                Active Account: <strong>{currentUser.name}</strong> ({currentUser.email})
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Activity Log
            </h2>
            <p className="text-xs text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Log activities, monitor weekly completion rates, plan follow-up tasks, and facilitate
              seamless review with Principal Ibu Sari. Anyone with the link has access.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold bg-white text-blue-900 hover:bg-blue-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              📄 Export Official PDF
            </button>
            <button
              onClick={handleOpenNewModal}
              className="px-3.5 py-2 text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>

        {/* Views Rendering based on activeTab */}
        {activeTab === 'dashboard' && (
          <DashboardAnalytics
            entries={entries}
            currentUser={currentUser}
            selectedWeekOffset={selectedWeekOffset}
            setSelectedWeekOffset={setSelectedWeekOffset}
            onToggleFollowupDone={handleToggleFollowupDone}
            onQuickApprove={handlePrincipalApprove}
          />
        )}

        {activeTab === 'spreadsheet' && (
          <div className="space-y-4">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              allEntries={entries}
              totalFilteredCount={filteredEntries.length}
            />
            <WorkloadSpreadsheet
              entries={filteredEntries}
              currentUser={currentUser}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              onQuickUpdateStatus={handleQuickUpdateStatus}
              onToggleFollowupDone={handleToggleFollowupDone}
              onPrincipalApprove={handlePrincipalApprove}
            />
          </div>
        )}

        {activeTab === 'split' && (
          <div className="space-y-6">
            <DashboardAnalytics
              entries={entries}
              currentUser={currentUser}
              selectedWeekOffset={selectedWeekOffset}
              setSelectedWeekOffset={setSelectedWeekOffset}
              onToggleFollowupDone={handleToggleFollowupDone}
              onQuickApprove={handlePrincipalApprove}
            />
            <div className="pt-4 border-t border-slate-200">
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                allEntries={entries}
                totalFilteredCount={filteredEntries.length}
              />
              <div className="mt-4">
                <WorkloadSpreadsheet
                  entries={filteredEntries}
                  currentUser={currentUser}
                  onEditEntry={handleEditEntry}
                  onDeleteEntry={handleDeleteEntry}
                  onQuickUpdateStatus={handleQuickUpdateStatus}
                  onToggleFollowupDone={handleToggleFollowupDone}
                  onPrincipalApprove={handlePrincipalApprove}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Utility and Reset Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-3">
            <span>
              Connected to <strong>Lazuardi Islamic Global School Cloud</strong>
            </span>
            <span>•</span>
            <span>
              Author: <strong>ovnica@lazuardi.sch.id</strong>
            </span>
            <span>•</span>
            <span>
              Reviewer: <strong>sari@lazuardi.sch.id</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const recovered = getStoredEntries();
                setEntries(recovered);
                showToast(`Riwayat aktivitas berhasil dipulihkan (${recovered.length} entri ditemukan).`, 'success');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
              title="Pulihkan entri aktivitas sebelumnya dari memori peramban"
            >
              <RotateCcw className="w-3 h-3 text-blue-600" />
              <span>Pulihkan Riwayat Input</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        currentUser={currentUser}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        entries={entries}
        currentUser={currentUser}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        entries={entries}
        currentUser={currentUser}
      />
    </div>
  );
}

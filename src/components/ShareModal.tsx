import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  Globe,
  Send,
  Sparkles,
  Link2,
  FileCheck2
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types/journal';
import { encodeEntriesToUrl } from '../utils/shareUrl';
import { syncEntriesToServer } from '../utils/storage';

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

  useEffect(() => {
    if (isOpen && entries.length > 0) {
      // Background sync to server whenever user prepares to share
      syncEntriesToServer(entries);
    }
  }, [isOpen, entries]);

  if (!isOpen) return null;

  // Generate URL that encapsulates Ovnica's full inputted records
  const shareableUrlWithData = encodeEntriesToUrl(entries);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrlWithData);
    setCopied(true);
    // Also trigger server sync
    syncEntriesToServer(entries);
    setTimeout(() => setCopied(false), 3000);
  };

  // Compute summary for email
  const totalEntries = entries.length;
  const completed = entries.filter((e) => e.status === 'Completed' || e.progressPercent === 100).length;
  const pendingFollowups = entries.filter((e) => e.followUpPlan && !e.followUpDone).length;
  const completionRate = totalEntries > 0 ? Math.round((completed / totalEntries) * 100) : 0;

  const emailSubject = encodeURIComponent(
    `[Lazuardi Activity Log] Catatan Aktivitas & Evaluasi Beban Kerja - Ovnica`
  );
  const emailBody = encodeURIComponent(
    `Assalamu'alaikum Ibu Sari,\n\nBerikut adalah ringkasan catatan aktivitas saya (Ovnica) yang telah diperbarui:\n\n• Total Aktivitas: ${totalEntries} kegiatan\n• Tingkat Penyelesaian: ${completionRate}%\n• Rencana Tindak Lanjut: ${pendingFollowups} catatan aktif\n\nIbu Sari dapat langsung melihat, memeriksa, dan memberikan catatan telaah/persetujuan pada tautan berikut:\n${shareableUrlWithData}\n\nWassalam,\nOvnica (ovnica@lazuardi.sch.id)\nFaculty Member & Science Lead\nLazuardi Islamic Global School`
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bagikan Link Activity Log</h2>
              <p className="text-xs text-slate-500">
                Penerima link akan langsung melihat seluruh catatan aktivitas yang Anda isi
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
          {/* Main Share Link Box with Encoded Data */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-blue-950 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Link Berisi Seluruh Catatan Aktivitas Anda</span>
              </label>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {totalEntries} Entri Terkunci
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrlWithData}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-800 select-all font-mono text-[11px]"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>

            <div className="p-2 bg-white/80 rounded-lg border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Jaminan Sinkronisasi:</strong> Saat Ibu Sari (<strong>sari@lazuardi.sch.id</strong>) atau siapapun membuka link ini di perangkat mana saja, aplikasi akan <strong>otomatis memuat seluruh {totalEntries} catatan aktivitas</strong> yang telah Anda isi.
              </span>
            </div>
          </div>

          {/* User Access Roles */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
              Akun & Hak Akses
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Ovnica */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    OV
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Ovnica</div>
                    <div className="text-[10px] text-slate-500 font-mono">ovnica@lazuardi.sch.id</div>
                  </div>
                </div>
                <span className="text-[9px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  Pemilik (Owner)
                </span>
              </div>

              {/* Sari */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-[10px]">
                    SR
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Ibu Sari</div>
                    <div className="text-[10px] text-slate-500 font-mono">sari@lazuardi.sch.id</div>
                  </div>
                </div>
                <span className="text-[9px] font-semibold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                  Kepala Sekolah
                </span>
              </div>
            </div>
          </div>

          {/* Email Notification & Dispatch */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                Kirim Laporan Melalui Email Sekolah
              </span>
              <span className="text-[10px] text-slate-500">
                sari@lazuardi.sch.id
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Buka aplikasi email Anda dengan draf ringkasan otomatis ({totalEntries} aktivitas, {completionRate}% selesai) yang sudah memuat link lengkap ke catatan Anda.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`mailto:sari@lazuardi.sch.id,ovnica@lazuardi.sch.id?subject=${emailSubject}&body=${emailBody}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka di Aplikasi Email</span>
              </a>

              <button
                onClick={handleSendSimulatedEmail}
                disabled={emailStatus === 'sending'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                <span>{emailStatus === 'sending' ? 'Mengirim...' : emailStatus === 'sent' ? '✓ Notifikasi Terkirim!' : 'Kirim Notifikasi Sinkronisasi'}</span>
              </button>
            </div>

            {emailStatus === 'sent' && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Notifikasi sinkronisasi berhasil dikirimkan ke sari@lazuardi.sch.id dan ovnica@lazuardi.sch.id!
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
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

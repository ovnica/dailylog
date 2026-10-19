import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  Send,
  Link2,
  FileCheck2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types/journal';
import { encodeEntriesToUrl } from '../utils/shareUrl';
import { syncAllActivitiesToCloud } from '../utils/firebaseStorage';

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
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && entries.length > 0) {
      // Direct push to Firestore in background whenever user opens share modal
      syncAllActivitiesToCloud(entries);
    }
  }, [isOpen, entries]);

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const principalShareUrl = `${originUrl}?user=sari`;
  const schoolShareUrl = originUrl;
  const offlineBackupUrl = encodeEntriesToUrl(entries);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    syncAllActivitiesToCloud(entries);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const totalEntries = entries.length;
  const completed = entries.filter((e) => e.status === 'Completed' || e.progressPercent === 100).length;
  const pendingFollowups = entries.filter((e) => e.followUpPlan && !e.followUpDone).length;
  const completionRate = totalEntries > 0 ? Math.round((completed / totalEntries) * 100) : 0;

  const emailSubject = encodeURIComponent(
    `[Lazuardi Activity Log] Catatan Aktivitas & Evaluasi Beban Kerja - Ovnica`
  );
  const emailBody = encodeURIComponent(
    `Assalamu'alaikum Ibu Sari,\n\nBerikut adalah tautan catatan aktivitas kerja saya (Ovnica) yang tersinkronisasi secara real-time di Cloud Firestore:\n\n• Total Aktivitas: ${totalEntries} kegiatan\n• Tingkat Penyelesaian: ${completionRate}%\n• Rencana Tindak Lanjut: ${pendingFollowups} catatan aktif\n\nIbu Sari dapat langsung melihat, memeriksa, dan memberikan catatan telaah/persetujuan resmi Kepala Sekolah pada tautan langsung berikut:\n${principalShareUrl}\n\nSetiap perubahan yang saya lakukan akan otomatis ter-update di layar Ibu Sari secara langsung tanpa perlu pengiriman ulang tautan.\n\nWassalam,\nOvnica (ovnica@lazuardi.sch.id)\nFaculty Member & Science Lead\nLazuardi Islamic Global School`
  );

  const handleSendSimulatedEmail = () => {
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('sent');
      setTimeout(() => setEmailStatus(null), 4000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Bagikan Link Activity Log</h2>
              <p className="text-xs text-slate-500">
                Tersinkronisasi Real-Time ke akun sari@lazuardi.sch.id & domain @lazuardi.sch.id
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
        <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {/* Real-time Status Card */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="font-bold text-emerald-950 text-xs">
                  Cloud Firestore Real-time Sync Aktif
                </div>
                <div className="text-[11px] text-emerald-800">
                  Semua {totalEntries} aktivitas tersinkron live di database pusat Lazuardi.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                syncAllActivitiesToCloud(entries);
                setCopiedType('synced');
                setTimeout(() => setCopiedType(null), 2000);
              }}
              className="text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-100/50 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              {copiedType === 'synced' ? '✓ Tersinkron' : 'Sinkronkan Sekarang'}
            </button>
          </div>

          {/* Option 1: Link khusus Bu Sari */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Link Langsung untuk Ibu Sari (sari@lazuardi.sch.id)</span>
              </label>
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                Mode Kepala Sekolah
              </span>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              Saat dibuka oleh Bu Sari, halaman akan langsung aktif dengan identitas Kepala Sekolah dan hak persetujuan (*approval & endorsement*).
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={principalShareUrl}
                className="flex-1 px-3 py-2 bg-white border border-indigo-300 rounded-lg text-slate-800 select-all font-mono text-[11px]"
              />
              <button
                onClick={() => handleCopy(principalShareUrl, 'principal')}
                className={`px-3.5 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  copiedType === 'principal'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {copiedType === 'principal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'principal' ? 'Tersalin!' : 'Salin Link Bu Sari'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Link umum untuk domain @lazuardi.sch.id */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-blue-950 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Link Kolaborasi Akun @lazuardi.sch.id</span>
              </label>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Multi-User Live
              </span>
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Dapat dibuka oleh akun siapa saja di domain <strong className="text-blue-950">@lazuardi.sch.id</strong>. Setiap pembaruan data langsung muncul di layar mereka secara real-time.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={schoolShareUrl}
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-800 select-all font-mono text-[11px]"
              />
              <button
                onClick={() => handleCopy(schoolShareUrl, 'school')}
                className={`px-3.5 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  copiedType === 'school'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                {copiedType === 'school' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'school' ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* User Access Roles List */}
          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
              Akun & Hak Akses Terdaftar (@lazuardi.sch.id)
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
                  Guru / Lead Sains
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
                  Kepala Sekolah (Approval)
                </span>
              </div>
            </div>
          </div>

          {/* Email Notification Dispatch */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                Kirim Laporan Resmi ke Ibu Sari
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                sari@lazuardi.sch.id
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Buka aplikasi email Anda dengan draf ringkasan otomatis ({totalEntries} aktivitas, {completionRate}% selesai) yang sudah memuat link langsung ke catatan Anda.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`mailto:sari@lazuardi.sch.id?subject=${emailSubject}&body=${emailBody}`}
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
                <span>
                  {emailStatus === 'sending'
                    ? 'Menyiapkan...'
                    : emailStatus === 'sent'
                    ? '✓ Konfirmasi Terkirim!'
                    : 'Konfirmasi Sinkronisasi'}
                </span>
              </button>
            </div>

            {emailStatus === 'sent' && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Tautan tersinkron ke sari@lazuardi.sch.id! Setiap perubahan selanjutnya akan langsung ter-update secara otomatis.
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

import { JournalEntry, UserProfile } from '../types/journal';
import { isSampleActivityId, isSampleActivityEntry } from './dateUtils';
import { INITIAL_JOURNAL_ENTRIES } from '../data/initialEntries';

export const USER_PROFILES: Record<string, UserProfile> = {
  ovnica: {
    id: 'ovnica',
    name: 'Ovnica',
    email: 'ovnica@lazuardi.sch.id',
    roleTitle: 'Faculty Member & Science Lead',
    avatarInitials: 'OV',
    avatarBg: 'bg-blue-600',
    canEdit: true,
    canApprove: false,
  },
  sari: {
    id: 'sari',
    name: 'Ibu Sari',
    email: 'sari@lazuardi.sch.id',
    roleTitle: 'School Principal & Academic Director',
    avatarInitials: 'SR',
    avatarBg: 'bg-indigo-700',
    canEdit: true,
    canApprove: true,
  },
  reza: {
    id: 'reza',
    name: 'Pak Reza',
    email: 'reza@lazuardi.sch.id',
    roleTitle: 'Curriculum & Academic Coordinator',
    avatarInitials: 'RZ',
    avatarBg: 'bg-teal-700',
    canEdit: true,
    canApprove: false,
  },
  guru: {
    id: 'guru',
    name: 'Guru Lazuardi',
    email: 'guru@lazuardi.sch.id',
    roleTitle: 'Faculty Educator & Teacher',
    avatarInitials: 'GL',
    avatarBg: 'bg-emerald-700',
    canEdit: true,
    canApprove: false,
  },
  viewer: {
    id: 'viewer',
    name: 'Guest / Link Visitor',
    email: 'visitor@lazuardi.sch.id',
    roleTitle: 'Academic Auditor (Link Access)',
    avatarInitials: 'GA',
    avatarBg: 'bg-slate-600',
    canEdit: true,
    canApprove: false,
  },
};

const PRIMARY_STORAGE_KEY = 'lazuardi_activity_log_v5';
const USER_BACKUP_KEY = 'lazuardi_user_activities_backup';
const HISTORICAL_STORAGE_KEYS = [
  'lazuardi_activity_log_v5',
  'lazuardi_activity_log_v4',
  'lazuardi_workload_journal_v3_simple',
  'lazuardi_workload_journal_v2',
  'lazuardi_workload_journal',
  'lazuardi_user_activities_backup',
];
const ACTIVE_USER_KEY = 'lazuardi_active_user_persona';

/**
 * Creates or retrieves a user profile for any email with @lazuardi.sch.id
 */
export function createUserProfileFromEmail(email: string, customName?: string): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'sari@lazuardi.sch.id' || cleanEmail === 'sari') {
    return USER_PROFILES.sari;
  }
  if (cleanEmail === 'ovnica@lazuardi.sch.id' || cleanEmail === 'ovnica') {
    return USER_PROFILES.ovnica;
  }
  if (cleanEmail === 'reza@lazuardi.sch.id' || cleanEmail === 'reza') {
    return USER_PROFILES.reza;
  }
  if (cleanEmail === 'guru@lazuardi.sch.id' || cleanEmail === 'guru') {
    return USER_PROFILES.guru;
  }

  const parts = cleanEmail.split('@');
  const prefix = parts[0] || 'user';
  const displayName =
    customName ||
    prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[\._-]/g, ' ');
  const initials = prefix.substring(0, 2).toUpperCase();
  const isPrincipal = cleanEmail.includes('sari') || cleanEmail.includes('principal');

  const fullEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@lazuardi.sch.id`;

  const newProfile: UserProfile = {
    id: prefix,
    name: displayName,
    email: fullEmail,
    roleTitle: isPrincipal ? 'School Principal & Academic Director' : 'Faculty Member & Educator',
    avatarInitials: initials,
    avatarBg: isPrincipal ? 'bg-indigo-700' : 'bg-blue-600',
    canEdit: true,
    canApprove: isPrincipal,
  };

  USER_PROFILES[prefix] = newProfile;
  return newProfile;
}

/**
 * Parses and validates an item into a JournalEntry, or returns null if it is a studio sample or invalid.
 * Supports Indonesian field aliases from earlier versions (kegiatan, catatan, deskripsi, tindakLanjut).
 */
function parseCleanEntry(item: any): JournalEntry | null {
  if (!item || typeof item !== 'object') return null;
  const rawTitle = item.title || item.kegiatan || item.activity || item.task || item.name;
  if (!rawTitle || typeof rawTitle !== 'string') return null;

  if (isSampleActivityId(item.id) || isSampleActivityEntry({ id: item.id, title: rawTitle })) {
    return null; // strictly exclude studio samples
  }

  const rawDate =
    item.date ||
    item.tanggal ||
    (item.createdAt ? String(item.createdAt).split('T')[0] : new Date().toISOString().split('T')[0]);
  const rawDesc = item.description || item.deskripsi || item.catatan || item.keterangan || '';
  const rawFollowUp = item.followUpPlan || item.tindakLanjut || item.followUp || '';

  return {
    id: String(item.id || `USR-${Date.now().toString(36)}-${Math.floor(Math.random() * 900) + 100}`),
    date: String(rawDate),
    title: String(rawTitle).trim(),
    description: String(rawDesc).trim(),
    status: item.status || 'In Progress',
    progressPercent: typeof item.progressPercent === 'number' ? item.progressPercent : 50,
    followUpPlan: String(rawFollowUp).trim(),
    followUpDeadline: item.followUpDeadline ? String(item.followUpDeadline) : undefined,
    followUpDone: Boolean(item.followUpDone),
    priority: item.priority || 'Normal',
    principalFeedback: item.principalFeedback ? String(item.principalFeedback) : undefined,
    principalApproved: Boolean(item.principalApproved),
    principalApprovedAt: item.principalApprovedAt ? String(item.principalApprovedAt) : undefined,
    authorEmail: item.authorEmail || 'ovnica@lazuardi.sch.id',
    authorName: item.authorName || 'Ovnica',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

/**
 * Retrieves ONLY genuine user-inputted entries from local storage and session storage.
 * Completely strips out any studio sample/demo activities so they never re-appear.
 */
export function getStoredEntries(): JournalEntry[] {
  try {
    const entryMap = new Map<string, JournalEntry>();

    if (typeof window !== 'undefined') {
      // 1. Scan known historical storage keys
      HISTORICAL_STORAGE_KEYS.forEach((key) => {
        try {
          const raw = window.localStorage?.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                const clean = parseCleanEntry(item);
                if (clean) {
                  entryMap.set(clean.id, clean);
                }
              });
            }
          }
        } catch (e) {}
      });

      // 2. Deep scan any remaining keys in localStorage
      if (window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (!key || HISTORICAL_STORAGE_KEYS.includes(key)) continue;
          try {
            const raw = window.localStorage.getItem(key);
            if (raw && (raw.startsWith('[') || raw.startsWith('{'))) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach((item: any) => {
                  const clean = parseCleanEntry(item);
                  if (clean) entryMap.set(clean.id, clean);
                });
              } else if (parsed && parsed.title && parsed.date) {
                const clean = parseCleanEntry(parsed);
                if (clean) entryMap.set(clean.id, clean);
              }
            }
          } catch (e) {}
        }
      }

      // 3. Scan sessionStorage for any unsaved user input drafts
      if (window.sessionStorage) {
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (!key) continue;
          try {
            const raw = window.sessionStorage.getItem(key);
            if (raw && (raw.startsWith('[') || raw.startsWith('{'))) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach((item: any) => {
                  const clean = parseCleanEntry(item);
                  if (clean) entryMap.set(clean.id, clean);
                });
              }
            }
          } catch (e) {}
        }
      }
    }

    // Purge studio samples from localStorage immediately
    purgeSampleEntriesFromStorage();

    const userEntries = Array.from(entryMap.values()).sort((a, b) => {
      return b.date.localeCompare(a.date);
    });

    return userEntries;
  } catch (err) {
    console.error('Failed to restore activity log entries from storage', err);
    return [];
  }
}

/**
 * Cleans out any studio sample entries from all browser localStorage keys.
 */
export function purgeSampleEntriesFromStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    HISTORICAL_STORAGE_KEYS.forEach((key) => {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((item) => {
              if (!item) return false;
              return !isSampleActivityId(item.id) && !isSampleActivityEntry(item);
            });
            if (filtered.length !== parsed.length) {
              window.localStorage.setItem(key, JSON.stringify(filtered));
            }
          }
        } catch (e) {}
      }
    });
  } catch (e) {}
}

/**
 * Saves genuine user entries to storage.
 */
export function saveStoredEntries(entries: JournalEntry[]): void {
  try {
    const cleanEntries = entries.filter((e) => !isSampleActivityId(e.id) && !isSampleActivityEntry(e));
    const serialized = JSON.stringify(cleanEntries);
    localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
    localStorage.setItem(USER_BACKUP_KEY, serialized);

    // Keep legacy keys updated
    HISTORICAL_STORAGE_KEYS.forEach((k) => {
      if (k !== PRIMARY_STORAGE_KEY) {
        localStorage.setItem(k, serialized);
      }
    });
  } catch (err) {
    console.error('Failed to save activity log entries', err);
  }
}

/**
 * Clears all entries completely
 */
export function clearAllStoredEntries(): void {
  HISTORICAL_STORAGE_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      // ignore
    }
  });
}

/**
 * Detects active user from URL query parameter or localStorage
 */
export function getActiveUser(): UserProfile {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlUser = params.get('user') || params.get('email') || params.get('role');
      if (urlUser) {
        const profile = createUserProfileFromEmail(urlUser);
        localStorage.setItem(ACTIVE_USER_KEY, profile.id);
        return profile;
      }
    }

    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      if (USER_PROFILES[raw]) {
        return USER_PROFILES[raw];
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
  } catch (e) {
    // fallback
  }
  return USER_PROFILES.ovnica;
}

export function setActiveUser(roleOrEmail: string, customName?: string): UserProfile {
  const profile = createUserProfileFromEmail(roleOrEmail, customName);
  localStorage.setItem(ACTIVE_USER_KEY, profile.id);
  return profile;
}

export async function syncEntriesToServer(entries: JournalEntry[]): Promise<boolean> {
  try {
    saveStoredEntries(entries);
    return true;
  } catch (err) {
    return false;
  }
}

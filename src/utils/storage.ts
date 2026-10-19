import { JournalEntry, UserProfile } from '../types/journal';
import { isSampleActivityId } from './dateUtils';

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
const HISTORICAL_STORAGE_KEYS = [
  'lazuardi_activity_log_v5',
  'lazuardi_activity_log_v4',
  'lazuardi_workload_journal_v3_simple',
  'lazuardi_workload_journal_v2',
  'lazuardi_workload_journal',
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
 * Retrieves ONLY genuine user-inputted entries from local storage.
 * Completely strips out any studio sample/demo activities so they never re-appear.
 */
export function getStoredEntries(): JournalEntry[] {
  try {
    const entryMap = new Map<string, JournalEntry>();

    // Scan storage keys from oldest to newest, but strictly filter out sample activities
    HISTORICAL_STORAGE_KEYS.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item && item.id && item.title) {
                // If it is a studio sample activity, completely ignore and skip it
                if (isSampleActivityId(item.id)) {
                  return;
                }

                const cleanEntry: JournalEntry = {
                  id: String(item.id),
                  date: String(item.date),
                  title: String(item.title),
                  description: String(item.description || ''),
                  status: item.status || 'In Progress',
                  progressPercent: typeof item.progressPercent === 'number' ? item.progressPercent : 50,
                  followUpPlan: String(item.followUpPlan || ''),
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

                entryMap.set(cleanEntry.id, cleanEntry);
              }
            });
          }
        }
      } catch (keyErr) {
        // skip corrupted key
      }
    });

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
 * Saves genuine user entries to storage.
 */
export function saveStoredEntries(entries: JournalEntry[]): void {
  try {
    // Ensure zero sample entries ever get stored
    const userOnly = entries.filter((e) => !isSampleActivityId(e.id));
    const serialized = JSON.stringify(userOnly);
    localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);

    // Keep legacy keys updated without sample entries
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

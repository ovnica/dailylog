import { JournalEntry, UserProfile } from '../types/journal';

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
  viewer: {
    id: 'viewer',
    name: 'Guest / Link Visitor',
    email: 'visitor@lazuardi.sch.id',
    roleTitle: 'Academic Auditor (Link Access)',
    avatarInitials: 'GA',
    avatarBg: 'bg-slate-600',
    canEdit: false,
    canApprove: false,
  },
};

const PRIMARY_STORAGE_KEY = 'lazuardi_activity_log_v4';
const HISTORICAL_STORAGE_KEYS = [
  'lazuardi_workload_journal_v3_simple',
  'lazuardi_workload_journal_v2',
  'lazuardi_workload_journal',
  'lazuardi_activity_log_v4',
];
const ACTIVE_USER_KEY = 'lazuardi_active_user_persona';

// Baseline seed data (including LZ series and recent dates)
const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: 'AL-2026-010',
    date: '2026-10-15',
    title: 'Grade 8 Science Practical Lab: Photosynthesis & Chloroplast Exploration',
    description: 'Prepared lab stations, microscopes, and iodine reagent safety protocols for 28 students. Supervised experiential inquiry session.',
    status: 'Completed',
    progressPercent: 100,
    followUpPlan: 'Collate student digital lab worksheets on Google Classroom and review anomalous data points with students next Monday.',
    followUpDeadline: '2026-10-19',
    followUpDone: false,
    priority: 'High',
    principalFeedback: 'Great inquiry-based structure. Excellent emphasis on laboratory safety and student autonomy.',
    principalApproved: true,
    principalApprovedAt: '2026-10-15T15:30:00Z',
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-15T15:30:00Z',
  },
  {
    id: 'AL-2026-011',
    date: '2026-10-15',
    title: 'Science Fair Booth Equipment Verification & Safety Checklist',
    description: 'Inspected power extensions, display boards, and table allocations for 14 student project groups in the auditorium.',
    status: 'In Progress',
    progressPercent: 70,
    followUpPlan: 'Confirm final roster with Pak Bambang in Facilities before tomorrow morning.',
    followUpDeadline: '2026-10-16',
    followUpDone: false,
    priority: 'High',
    principalFeedback: 'Good preparation. Ensure all fire safety exits remain unobstructed.',
    principalApproved: false,
    createdAt: '2026-10-15T10:15:00Z',
    updatedAt: '2026-10-15T13:45:00Z',
  },
  {
    id: 'AL-2026-012',
    date: '2026-10-14',
    title: 'Mid-Semester Summative Assessment Blueprint & Rubric Alignment',
    description: 'Formulated Cambridge checkpoint aligned physics & biology questions, including Bloom taxonomy differentiation for higher-order thinking.',
    status: 'In Progress',
    progressPercent: 85,
    followUpPlan: 'Submit final draft blueprint to Academic Coordinator (Ibu Sari) for curriculum audit and benchmark sign-off.',
    followUpDeadline: '2026-10-16',
    followUpDone: false,
    priority: 'High',
    principalFeedback: 'Ensure Section C has contextual problems touching on Islamic perspectives on environmental balance (Mizan).',
    principalApproved: false,
    createdAt: '2026-10-14T09:15:00Z',
    updatedAt: '2026-10-14T14:45:00Z',
  },
  {
    id: 'AL-2026-013',
    date: '2026-10-14',
    title: 'Weekly Department Coordination with Principal Sari',
    description: 'Attended faculty sync to review Q4 interdisciplinary STEM activities, student character reports, and teacher peer observation schedules.',
    status: 'Completed',
    progressPercent: 100,
    followUpPlan: 'Send compiled observation schedule to all science faculty members.',
    followUpDeadline: '2026-10-17',
    followUpDone: true,
    priority: 'Normal',
    principalFeedback: 'Agreed on the timeline. Thank you for the proactive facilitation.',
    principalApproved: true,
    principalApprovedAt: '2026-10-14T16:00:00Z',
    createdAt: '2026-10-14T13:30:00Z',
    updatedAt: '2026-10-14T16:00:00Z',
  },
  {
    id: 'LZ-2026-003',
    date: '2026-10-13',
    title: 'Pastoral Advisory & Student Character Development (Budi Pekerti)',
    description: 'Individual pastoral counseling with 4 Grade 8 advisory students regarding academic resilience and collaborative peer projects.',
    status: 'Completed',
    progressPercent: 100,
    followUpPlan: 'Send brief WhatsApp updates to parents regarding student goal-setting progress before Friday.',
    followUpDeadline: '2026-10-16',
    followUpDone: true,
    priority: 'Medium',
    principalFeedback: 'Noted and appreciated. Positive parent engagement is a core Lazuardi pillar.',
    principalApproved: true,
    principalApprovedAt: '2026-10-13T17:10:00Z',
    createdAt: '2026-10-13T13:00:00Z',
    updatedAt: '2026-10-13T17:10:00Z',
  },
  {
    id: 'LZ-2026-005',
    date: '2026-10-12',
    title: 'Grading Formative Quizzes & Diagnostic Feedback on Cellular Respiration',
    description: 'Evaluated 52 student formative quiz submissions. Provided personalized margin comments and marked misconceptions.',
    status: 'Completed',
    progressPercent: 100,
    followUpPlan: 'Design a 10-minute remediation mini-lesson for students scoring below 70% threshold.',
    followUpDeadline: '2026-10-16',
    followUpDone: false,
    priority: 'Normal',
    principalFeedback: 'Solid diagnostic tracking.',
    principalApproved: true,
    principalApprovedAt: '2026-10-13T09:00:00Z',
    createdAt: '2026-10-12T15:00:00Z',
    updatedAt: '2026-10-13T09:00:00Z',
  },
  {
    id: 'LZ-2026-006',
    date: '2026-10-08',
    title: 'School Accreditation & Digital Portfolio Documentation Compilation',
    description: 'Organized syllabus evidence, student exemplar works, and lesson reflection logs for institutional academic review.',
    status: 'In Progress',
    progressPercent: 65,
    followUpPlan: 'Scan remaining physical student signature sheets and upload to shared Lazuardi cloud drive folder.',
    followUpDeadline: '2026-10-18',
    followUpDone: false,
    priority: 'Medium',
    principalFeedback: 'Progress looks good. Need folder finalized before the external validator preview.',
    principalApproved: false,
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-08T12:00:00Z',
  },
  {
    id: 'LZ-2026-007',
    date: '2026-10-05',
    title: 'Professional Learning Community (PLC): Inquiry-Based Learning Strategies',
    description: 'Participated in regional webinar on multi-tiered instructional scaffolding and peer learning mechanics.',
    status: 'Completed',
    progressPercent: 100,
    followUpPlan: 'Share 2 actionable formative techniques with science department colleagues during next briefing.',
    followUpDeadline: '2026-10-19',
    followUpDone: true,
    priority: 'Low',
    principalFeedback: 'Excellent initiative in expanding pedagogical toolkit.',
    principalApproved: true,
    principalApprovedAt: '2026-10-06T08:30:00Z',
    createdAt: '2026-10-05T15:30:00Z',
    updatedAt: '2026-10-06T08:30:00Z',
  },
  {
    id: 'LZ-2026-008',
    date: '2026-10-04',
    title: 'Extracurricular Robotics & Young Scientist Club Coaching',
    description: 'Guided 15 club members on sensor integration and programming basic line-follower rovers for upcoming exhibition.',
    status: 'Completed',
    progressPercent: 100,
    followUpPlan: 'Order spare ultrasonic distance sensors and replacement LiPo battery packs.',
    followUpDeadline: '2026-10-20',
    followUpDone: false,
    priority: 'Normal',
    principalFeedback: 'Students are thoroughly excited for this!',
    principalApproved: true,
    principalApprovedAt: '2026-10-05T08:35:00Z',
    createdAt: '2026-10-04T13:30:00Z',
    updatedAt: '2026-10-05T08:35:00Z',
  },
];

/**
 * Retrieves stored entries by aggregating from historical storage keys
 * so that any routine entries the user previously created or edited are recovered.
 */
export function getStoredEntries(): JournalEntry[] {
  try {
    const entryMap = new Map<string, JournalEntry>();

    // 1. First, seed baseline entries into the map
    INITIAL_ENTRIES.forEach((entry) => {
      entryMap.set(entry.id, entry);
    });

    // 2. Scan all historical keys from oldest to newest so user's actual stored data takes precedence
    HISTORICAL_STORAGE_KEYS.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item && item.id && item.title) {
                // Sanitize entry to match JournalEntry structure
                const cleanEntry: JournalEntry = {
                  id: String(item.id),
                  date: String(item.date || '2026-10-15'),
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
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: item.updatedAt || new Date().toISOString(),
                };

                // Store or overwrite with the user's stored data
                entryMap.set(cleanEntry.id, cleanEntry);
              }
            });
          }
        }
      } catch (keyErr) {
        console.warn(`Could not read storage key: ${key}`, keyErr);
      }
    });

    const merged = Array.from(entryMap.values()).sort((a, b) => {
      return b.date.localeCompare(a.date);
    });

    if (merged.length > 0) {
      // Save unified list back across keys for full safety
      saveStoredEntries(merged);
      return merged;
    }

    return INITIAL_ENTRIES;
  } catch (err) {
    console.error('Failed to restore activity log entries from storage', err);
    return INITIAL_ENTRIES;
  }
}

/**
 * Saves entries to both primary and legacy keys for maximum redundancy
 */
export function saveStoredEntries(entries: JournalEntry[]): void {
  try {
    const serialized = JSON.stringify(entries);
    localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);

    // Also mirror to legacy keys so switching versions never loses data
    HISTORICAL_STORAGE_KEYS.forEach((k) => {
      if (k !== PRIMARY_STORAGE_KEY) {
        localStorage.setItem(k, serialized);
      }
    });

    // Asynchronously sync to server
    syncEntriesToServer(entries);
  } catch (err) {
    console.error('Failed to save activity log entries', err);
  }
}

export async function syncEntriesToServer(entries: JournalEntry[]): Promise<boolean> {
  try {
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    return false;
  }
}

export async function fetchEntriesFromServer(): Promise<JournalEntry[] | null> {
  try {
    const res = await fetch('/api/entries');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.entries) && data.entries.length > 0) {
      return data.entries;
    }
  } catch (err) {
    // fallback
  }
  return null;
}

export function resetToSeedEntries(): JournalEntry[] {
  saveStoredEntries(INITIAL_ENTRIES);
  return INITIAL_ENTRIES;
}

export function getActiveUser(): UserProfile {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw && USER_PROFILES[raw]) {
      return USER_PROFILES[raw];
    }
  } catch (e) {
    // fallback
  }
  return USER_PROFILES.ovnica;
}

export function setActiveUser(role: string): UserProfile {
  const user = USER_PROFILES[role] || USER_PROFILES.ovnica;
  localStorage.setItem(ACTIVE_USER_KEY, user.id);
  return user;
}

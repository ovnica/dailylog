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

const STORAGE_KEY = 'lazuardi_activity_log_v4';
const ACTIVE_USER_KEY = 'lazuardi_active_user_persona';

// Seed data with entries for Today (2026-10-15), Yesterday (2026-10-14), This Week, and earlier
const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: 'AL-2026-010',
    date: '2026-10-15', // TODAY
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
    date: '2026-10-15', // TODAY
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
    date: '2026-10-14', // YESTERDAY
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
    date: '2026-10-14', // YESTERDAY
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
    id: 'AL-2026-014',
    date: '2026-10-13', // THIS WEEK
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
    id: 'AL-2026-015',
    date: '2026-10-12', // THIS WEEK
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
    id: 'AL-2026-016',
    date: '2026-10-08', // EARLIER RECORD
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
    id: 'AL-2026-017',
    date: '2026-10-05', // EARLIER RECORD
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
    id: 'AL-2026-018',
    date: '2026-10-04', // EARLIER RECORD
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

export function getStoredEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredEntries(INITIAL_ENTRIES);
      return INITIAL_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ENTRIES;
  } catch (err) {
    console.error('Failed to load activity log entries from storage', err);
    return INITIAL_ENTRIES;
  }
}

export function saveStoredEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save activity log entries', err);
  }
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

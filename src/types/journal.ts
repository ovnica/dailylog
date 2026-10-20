export type EntryStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Pending Review'
  | 'Approved by Principal'
  | 'Blocked / Postponed';

export type PriorityLevel = 'High' | 'Medium' | 'Normal' | 'Low';

export type UserPersona = 'ovnica' | 'sari' | 'reza' | 'guru' | string;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  avatarInitials: string;
  avatarBg: string;
  canEdit: boolean;
  canApprove: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  status: EntryStatus;
  progressPercent: number; // 0-100
  followUpPlan: string; // Follow-up or planning for next
  followUpDeadline?: string; // YYYY-MM-DD
  followUpDone?: boolean;
  priority: PriorityLevel;
  principalFeedback?: string;
  principalApproved?: boolean;
  principalApprovedAt?: string;
  authorEmail?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  search: string;
  status: string;
  priority: string;
  dateRange: 'all' | 'this_week' | 'last_week' | 'today' | 'yesterday' | 'custom_date';
  selectedSpecificDate?: string; // for "pilih tanggal"
  weekOffset?: number; // 0 = current week, -1 = previous week, +1 = next week
  followUpFilter: 'all' | 'has_followup' | 'pending_followup' | 'completed_followup';
}

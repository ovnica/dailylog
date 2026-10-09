import { JournalEntry } from '../types/journal';

export interface WeeklyStats {
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalEntries: number;
  completedEntries: number;
  inProgressEntries: number;
  completionRate: number; // 0 - 100
  dailyActivities: { day: string; date: string; count: number; completedCount: number }[];
  principalApprovedCount: number;
  pendingFollowupCount: number;
  overdueFollowupCount: number;
}

// Returns YYYY-MM-DD
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekBounds(referenceDateStr?: string, weekOffset: number = 0): { start: Date; end: Date; label: string } {
  const base = referenceDateStr ? new Date(referenceDateStr) : new Date('2026-10-08');
  base.setDate(base.getDate() + weekOffset * 7);

  // Determine Monday as start of academic week
  const dayOfWeek = base.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(base);
  monday.setDate(base.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startFormatted = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    start: monday,
    end: sunday,
    label: `${startFormatted} – ${endFormatted}`,
  };
}

export function calculateWeeklyStats(
  entries: JournalEntry[],
  weekOffset: number = 0,
  referenceDateStr: string = '2026-10-08'
): WeeklyStats {
  const { start, end, label } = getWeekBounds(referenceDateStr, weekOffset);
  const startStr = formatDate(start);
  const endStr = formatDate(end);

  // Filter entries in this academic week
  const weekEntries = entries.filter((e) => e.date >= startStr && e.date <= endStr);

  const totalEntries = weekEntries.length;
  const completedEntries = weekEntries.filter(
    (e) => e.status === 'Completed' || e.status === 'Approved by Principal' || e.progressPercent === 100
  ).length;
  const inProgressEntries = weekEntries.filter(
    (e) => e.status === 'In Progress' || e.status === 'Pending Review'
  ).length;
  const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;

  // Daily activity distribution Monday - Sunday
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyActivities = days.map((dayName, idx) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + idx);
    const dayDateStr = formatDate(dayDate);
    const dayItems = weekEntries.filter((e) => e.date === dayDateStr);
    const completedItems = dayItems.filter(
      (e) => e.status === 'Completed' || e.status === 'Approved by Principal' || e.progressPercent === 100
    );

    return {
      day: dayName,
      date: dayDateStr,
      count: dayItems.length,
      completedCount: completedItems.length,
    };
  });

  const principalApprovedCount = weekEntries.filter((e) => e.principalApproved).length;

  const todayStr = '2026-10-08';
  const pendingFollowupCount = weekEntries.filter((e) => e.followUpPlan && !e.followUpDone).length;
  const overdueFollowupCount = weekEntries.filter(
    (e) => e.followUpPlan && !e.followUpDone && e.followUpDeadline && e.followUpDeadline < todayStr
  ).length;

  return {
    weekLabel: label,
    startDate: startStr,
    endDate: endStr,
    totalEntries,
    completedEntries,
    inProgressEntries,
    completionRate,
    dailyActivities,
    principalApprovedCount,
    pendingFollowupCount,
    overdueFollowupCount,
  };
}

export function getSmartProgressSummary(entry: JournalEntry): {
  label: string;
  badgeClass: string;
  isAttentionNeeded: boolean;
} {
  const todayStr = '2026-10-08';

  if (entry.principalApproved) {
    return {
      label: '100% · Endorsed by Principal Sari',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isAttentionNeeded: false,
    };
  }

  if (entry.status === 'Completed' || entry.progressPercent === 100) {
    if (entry.followUpPlan && !entry.followUpDone) {
      if (entry.followUpDeadline && entry.followUpDeadline < todayStr) {
        return {
          label: 'Completed · Overdue Next Action!',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
          isAttentionNeeded: true,
        };
      }
      return {
        label: '100% Done · Has Planned Follow-up',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        isAttentionNeeded: false,
      };
    }
    return {
      label: '100% Completed · Ready for Review',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isAttentionNeeded: false,
    };
  }

  if (entry.status === 'Blocked / Postponed') {
    return {
      label: `${entry.progressPercent}% · Blocked / Needs Guidance`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
      isAttentionNeeded: true,
    };
  }

  if (entry.followUpPlan && !entry.followUpDone && entry.followUpDeadline && entry.followUpDeadline < todayStr) {
    return {
      label: `${entry.progressPercent}% · Action Overdue (${entry.followUpDeadline})`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-medium',
      isAttentionNeeded: true,
    };
  }

  if (entry.progressPercent >= 75) {
    return {
      label: `${entry.progressPercent}% · Final Polish`,
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      isAttentionNeeded: false,
    };
  }

  if (entry.progressPercent > 0) {
    return {
      label: `${entry.progressPercent}% · In Progress`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      isAttentionNeeded: false,
    };
  }

  return {
    label: '0% · Not Started Yet',
    badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
    isAttentionNeeded: false,
  };
}

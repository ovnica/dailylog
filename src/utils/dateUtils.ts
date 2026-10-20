export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDateString(): string {
  return formatDate(new Date());
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

const INDO_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

const INDO_MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Formats YYYY-MM-DD to Indonesian human-readable date.
 */
export function formatIndonesianDate(dateStr?: string, withDayName: boolean = false): string {
  if (!dateStr) return '';
  try {
    const [yStr, mStr, dStr] = dateStr.split('-');
    if (!yStr || !mStr || !dStr) return dateStr;
    const year = parseInt(yStr, 10);
    const monthIdx = parseInt(mStr, 10) - 1;
    const day = parseInt(dStr, 10);
    const dateObj = new Date(year, monthIdx, day);

    const monthName = INDO_MONTHS_SHORT[monthIdx] || mStr;
    const base = `${day} ${monthName} ${year}`;
    if (withDayName) {
      const dayName = INDO_DAYS[dateObj.getDay()] || '';
      return `${dayName}, ${base}`;
    }
    return base;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Calculates academic week boundaries (Monday to Sunday)
 */
export function getWeekRange(refDate: Date = new Date(), offsetWeeks: number = 0): {
  start: string;
  end: string;
  label: string;
  fullLabel: string;
} {
  const d = new Date(refDate);
  d.setHours(0, 0, 0, 0);

  // If offsetWeeks is supplied, shift by that many weeks
  if (offsetWeeks !== 0) {
    d.setDate(d.getDate() + offsetWeeks * 7);
  }

  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday ...
  const diffToMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = formatDate(monday);
  const end = formatDate(sunday);

  const mLabel = `${monday.getDate()} ${INDO_MONTHS_SHORT[monday.getMonth()]}`;
  const sLabel = `${sunday.getDate()} ${INDO_MONTHS_SHORT[sunday.getMonth()]} ${sunday.getFullYear()}`;

  return {
    start,
    end,
    label: `${mLabel} – ${sLabel}`,
    fullLabel: `Senin, ${mLabel} – Minggu, ${sLabel}`,
  };
}

export function isDateInCurrentWeek(dateStr: string, refDate: Date = new Date(), offsetWeeks: number = 0): boolean {
  if (!dateStr) return false;
  const { start, end } = getWeekRange(refDate, offsetWeeks);
  return dateStr >= start && dateStr <= end;
}

// Known sample activity IDs from Studio templates that should be excluded
export const KNOWN_SAMPLE_ACTIVITY_IDS = new Set<string>([
  'ACT-LZ-001',
  'ACT-LZ-002',
  'ACT-LZ-003',
  'ACT-LZ-004',
  'ACT-LZ-005',
  'ACT-LZ-006',
  'ACT-LZ-007',
  'ACT-LZ-008',
  'ACT-LZ-009',
  'ACT-2026-010',
  'ACT-2026-011',
  'ACT-2026-012',
  'ACT-2026-013',
  'ACT-2026-014',
  'ACT-2026-015',
  'ACT-2026-016',
  'ACT-2026-017',
  'ACT-2026-018',
  'LZ-2026-001',
  'LZ-2026-002',
  'LZ-2026-003',
  'LZ-2026-004',
  'LZ-2026-005',
  'LZ-2026-006',
  'LZ-2026-007',
  'LZ-2026-008',
  'LZ-2026-009',
]);

export const KNOWN_SAMPLE_TITLES = [
  'Grade 8 Science Practical Lab',
  'Science Fair Booth Equipment',
  'Mid-Semester Summative Assessment',
  'Weekly Department Coordination with Principal Sari',
  'Pastoral Advisory & Student Character Development',
  'Grading Formative Quizzes & Diagnostic Feedback',
  'School Accreditation & Digital Portfolio',
  'Professional Learning Community (PLC)',
  'Extracurricular Robotics & Young Scientist Club Coaching',
  'Photosynthesis & Chloroplast',
  'Cellular Respiration',
  'Young Scientist Club',
  'Science Fair Booth',
];

/**
 * Checks whether an activity ID is a Studio sample dummy template.
 * Studio samples return true.
 * Real user entries return false.
 */
export function isSampleActivityId(id?: string): boolean {
  if (!id) return false;
  if (KNOWN_SAMPLE_ACTIVITY_IDS.has(id)) return true;
  if (
    id.startsWith('studio-sample') ||
    id.startsWith('sample-') ||
    id.startsWith('ACT-LZ-') ||
    id.startsWith('LZ-2026-')
  ) {
    return true;
  }
  return false;
}

/**
 * Checks whether an entry is a synthetic Studio sample based on ID or known sample title.
 */
export function isSampleActivityEntry(entry?: { id?: string; title?: string } | null): boolean {
  if (!entry) return false;
  if (entry.id && isSampleActivityId(entry.id)) return true;
  if (entry.title) {
    const lower = entry.title.toLowerCase();
    for (const sampleTitle of KNOWN_SAMPLE_TITLES) {
      if (lower.includes(sampleTitle.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}



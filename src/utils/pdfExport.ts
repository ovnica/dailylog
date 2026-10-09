import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JournalEntry } from '../types/journal';

export interface ReportMeta {
  teacherName: string;
  teacherEmail: string;
  principalName: string;
  principalEmail: string;
  dateRangeLabel: string;
}

export function exportWorkloadReportPDF(
  entries: JournalEntry[],
  meta: ReportMeta = {
    teacherName: 'Ovnica',
    teacherEmail: 'ovnica@lazuardi.sch.id',
    principalName: 'Ibu Sari',
    principalEmail: 'sari@lazuardi.sch.id',
    dateRangeLabel: 'Current Academic Term',
  }
) {
  // Landscape orientation gives superior column spacing for spreadsheet data
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const textDark = '#1e293b';
  const textMuted = '#64748b';

  // Header band
  doc.setFillColor(30, 58, 138); // Primary Navy
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Decorative accent line
  doc.setFillColor(59, 130, 246); // Accent Blue
  doc.rect(0, 55, pageWidth, 4, 'F');

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('LAZUARDI ISLAMIC GLOBAL SCHOOL', 36, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(219, 234, 254);
  doc.text('Faculty Academic Workload Journal & Progress Accountability Report', 36, 42);

  const timestamp = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Generated: ${timestamp}`, pageWidth - 36, 34, { align: 'right' });

  // Metadata Panel
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted);

  const metaTop = 75;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(36, metaTop, pageWidth - 72, 44, 4, 4, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, metaTop, pageWidth - 72, 44, 4, 4, 'S');

  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.text('Faculty Member:', 50, metaTop + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${meta.teacherName} (${meta.teacherEmail})`, 135, metaTop + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Principal / Reviewer:', 380, metaTop + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${meta.principalName} (${meta.principalEmail})`, 485, metaTop + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Scope / Period:', 50, metaTop + 34);
  doc.setFont('helvetica', 'normal');
  doc.text(meta.dateRangeLabel, 135, metaTop + 34);

  // Summary KPIs Calculation
  const totalEntries = entries.length;
  const completedEntries = entries.filter((e) => e.status === 'Completed' || e.progressPercent === 100).length;
  const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;
  const approvedEntries = entries.filter((e) => e.principalApproved).length;
  const pendingFollowups = entries.filter((e) => e.followUpPlan && !e.followUpDone).length;

  doc.setFont('helvetica', 'bold');
  doc.text('Audit Summary:', 380, metaTop + 34);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${totalEntries} activities logged | ${completionRate}% completed | ${approvedEntries} principal endorsements | ${pendingFollowups} active follow-ups`,
    485,
    metaTop + 34
  );

  // Simplified Table Data (No category, tags, or time)
  const tableRows = entries.map((entry, index) => {
    const followUpStr = entry.followUpPlan
      ? `${entry.followUpPlan}${entry.followUpDeadline ? `\n[Deadline: ${entry.followUpDeadline}]` : ''}${entry.followUpDone ? ' (✓ Completed)' : ''}`
      : '-';

    const principalNote = entry.principalFeedback
      ? `${entry.principalApproved ? '✓ APPROVED: ' : 'NOTE: '}${entry.principalFeedback}`
      : entry.principalApproved
      ? '✓ Approved'
      : 'Pending Principal Review';

    return [
      (index + 1).toString(),
      entry.date,
      `${entry.title}${entry.description ? `\n\n${entry.description}` : ''}`,
      `${entry.status}\n(${entry.progressPercent}%)`,
      followUpStr,
      principalNote,
    ];
  });

  autoTable(doc, {
    startY: 130,
    head: [
      [
        '#',
        'Date',
        'Activity & Workload Detail',
        'Status & Progress',
        'Follow-up / Planning Next',
        'Principal Endorsement (Ibu Sari)',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 65 },
      2: { cellWidth: 280 },
      3: { cellWidth: 90 },
      4: { cellWidth: 170 },
      5: { cellWidth: 140 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 36, right: 36, bottom: 90 },
    didDrawPage: (data) => {
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 36, pageHeight - 20, { align: 'right' });
      doc.text('Lazuardi Islamic Global School • Confidential Faculty Workload Record', 36, pageHeight - 20);
    },
  });

  // Endorsement Signature Block on the last page
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 30 : pageHeight - 100;
  const signatureY = finalY > pageHeight - 85 ? 40 : finalY;
  if (finalY > pageHeight - 85) {
    doc.addPage();
  }

  doc.setFontSize(9);
  doc.setTextColor(textDark);

  // Teacher signature block
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared & Submitted By:', 50, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________________________', 50, signatureY + 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${meta.teacherName}`, 50, signatureY + 48);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted);
  doc.text(`Faculty Member (${meta.teacherEmail})`, 50, signatureY + 58);

  // Principal endorsement block
  doc.setTextColor(textDark);
  doc.setFont('helvetica', 'bold');
  doc.text('Reviewed & Endorsed By:', pageWidth - 260, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________________________', pageWidth - 260, signatureY + 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${meta.principalName}`, pageWidth - 260, signatureY + 48);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted);
  doc.text(`Principal & Academic Director (${meta.principalEmail})`, pageWidth - 260, signatureY + 58);

  const filename = `Lazuardi_Workload_Journal_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export function exportWorkloadCSV(entries: JournalEntry[]): void {
  const headers = [
    'ID',
    'Date',
    'Title',
    'Description',
    'Status',
    'Progress (%)',
    'Follow-up Plan',
    'Follow-up Deadline',
    'Follow-up Completed',
    'Priority',
    'Principal Feedback',
    'Principal Approved',
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = entries.map((entry) => [
    escapeCsv(entry.id),
    escapeCsv(entry.date),
    escapeCsv(entry.title),
    escapeCsv(entry.description),
    escapeCsv(entry.status),
    entry.progressPercent,
    escapeCsv(entry.followUpPlan),
    escapeCsv(entry.followUpDeadline || ''),
    entry.followUpDone ? 'YES' : 'NO',
    escapeCsv(entry.priority),
    escapeCsv(entry.principalFeedback || ''),
    entry.principalApproved ? 'APPROVED' : 'PENDING',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Lazuardi_Workload_Log_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

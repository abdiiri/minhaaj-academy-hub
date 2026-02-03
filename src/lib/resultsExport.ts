import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentRecord } from '@/hooks/useStudents';
import { ClassRecord } from '@/hooks/useClasses';

interface ExportData {
  students: StudentRecord[];
  subjects: string[];
  scores: Record<string, Record<string, number | ''>>;
  averages: Record<string, number>;
  className: string;
  examType: string;
  examDate: string;
}

export function exportResultsToExcel(data: ExportData) {
  const { students, subjects, scores, averages, className, examType, examDate } = data;

  // Prepare header row
  const headers = ['Student Name', 'Admission No.', ...subjects, 'Total', 'Average'];
  
  // Prepare data rows
  const rows = students.map(student => {
    const studentScores = scores[student.id] || {};
    const subjectScores = subjects.map(subject => {
      const score = studentScores[subject];
      return typeof score === 'number' ? score : '';
    });
    
    const total = subjectScores.reduce<number>((sum, s) => sum + (typeof s === 'number' ? s : 0), 0);
    const validScores = subjectScores.filter(s => typeof s === 'number').length;
    const average = validScores > 0 ? (total / validScores).toFixed(1) : '';
    
    return [
      `${student.first_name} ${student.last_name}`,
      student.admission_number,
      ...subjectScores,
      total,
      average,
    ];
  });

  // Add average row
  const avgRow = [
    'Class Average',
    '',
    ...subjects.map(subject => averages[subject]?.toFixed(1) || ''),
    '',
    '',
  ];
  rows.push(avgRow);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Student Name
    { wch: 15 }, // Admission No.
    ...subjects.map(() => ({ wch: 12 })),
    { wch: 10 }, // Total
    { wch: 10 }, // Average
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');

  // Add metadata sheet
  const metaWs = XLSX.utils.aoa_to_sheet([
    ['Class', className],
    ['Exam Type', examType],
    ['Date', examDate],
    ['Generated', new Date().toLocaleDateString()],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, 'Info');

  // Download
  XLSX.writeFile(wb, `${className}_${examType}_${examDate}.xlsx`);
}

export function exportResultsToPDF(data: ExportData) {
  const { students, subjects, scores, averages, className, examType, examDate } = data;

  const doc = new jsPDF({
    orientation: subjects.length > 5 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFontSize(16);
  doc.text(`${className} - ${examType} Results`, 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Date: ${examDate}`, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 27);

  // Prepare table data
  const tableHeaders = ['Student', ...subjects, 'Total', 'Avg'];
  
  const tableData = students.map(student => {
    const studentScores = scores[student.id] || {};
    const subjectScores = subjects.map(subject => {
      const score = studentScores[subject];
      return typeof score === 'number' ? score.toString() : '-';
    });
    
    const total = subjects.reduce((sum, subject) => {
      const score = studentScores[subject];
      return sum + (typeof score === 'number' ? score : 0);
    }, 0);
    
    const validScores = subjects.filter(subject => typeof studentScores[subject] === 'number').length;
    const average = validScores > 0 ? (total / validScores).toFixed(1) : '-';
    
    return [
      `${student.first_name} ${student.last_name}`,
      ...subjectScores,
      total.toString(),
      average,
    ];
  });

  // Add average row
  tableData.push([
    'Class Average',
    ...subjects.map(subject => averages[subject]?.toFixed(1) || '-'),
    '',
    '',
  ]);

  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 32,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Student name column wider
    },
    footStyles: {
      fillColor: [243, 244, 246],
      fontStyle: 'bold',
    },
    didParseCell: (data) => {
      // Style the last row (averages)
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fillColor = [243, 244, 246];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Download
  doc.save(`${className}_${examType}_${examDate}.pdf`);
}

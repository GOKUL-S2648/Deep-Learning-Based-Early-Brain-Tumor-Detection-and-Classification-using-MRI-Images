import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MRIAnalysisResult } from '../types/radiology';

export interface CategoryPatientRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: string;
  classLabel?: string;
  biologicalNature?: string;
  diagnosis: string;
  whoGrade: string;
  confidence: number;
  tumorDetected: boolean;
  date: string;
  urgency: string;
  indication: string;
}

export interface PDFExportOptions {
  analysis: MRIAnalysisResult;
  patient: {
    name: string;
    mrn: string;
    age: number;
    sex: string;
    indication: string;
    studyDate: string;
  };
  keySliceCanvas?: HTMLCanvasElement | null;
  radiologistName?: string;
  radiologistNotes?: string;
  isSigned?: boolean;
}

export async function generateRadiologyReportPDF(options: PDFExportOptions, existingDoc?: jsPDF): Promise<jsPDF> {
  const {
    analysis,
    patient,
    keySliceCanvas,
    radiologistName = 'Dr. Marcus Sterling, MD (Neuroradiology)',
    radiologistNotes = '',
    isSigned = true,
  } = options;

  const doc = existingDoc || new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeader = (pageNum: number, totalPagesPlaceholder = false) => {
    // Top institutional accent band
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, 10, contentWidth, 1.5, 'F');
  };

  const addFooter = (pageNum: number) => {
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('CONFIDENTIAL MEDICAL RECORD · BRAINTUMORAI CADX CLINICAL SYSTEM', margin, pageHeight - 7.5);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number): boolean => {
    if (y + neededHeight > pageHeight - 16) {
      addFooter(doc.getNumberOfPages());
      doc.addPage();
      y = margin + 4;
      addHeader(doc.getNumberOfPages());
      return true;
    }
    return false;
  };

  // Start Page 1
  addHeader(1);

  // 1. INSTITUTIONAL HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229); // slate-900
  doc.text('ACADEMIC MEDICAL CENTER · DEPARTMENT OF NEURORADIOLOGY', margin, y + 4);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Brain MRI Diagnostic Radiology Report', margin, y + 3);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Deep Learning CADx Classification & Structural Morphometry Assessment', margin, y + 2);

  // Status & Date on right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`MRN: ${patient.mrn}`, pageWidth - margin, y - 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Exam Date: ${patient.studyDate}`, pageWidth - margin, y - 1, { align: 'right' });

  if (isSigned) {
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL / VERIFIED', pageWidth - margin, y + 3, { align: 'right' });
  } else {
    doc.setTextColor(217, 119, 6); // amber-600
    doc.setFont('helvetica', 'bold');
    doc.text('PRELIMINARY AI CADX', pageWidth - margin, y + 3, { align: 'right' });
  }

  y += 6;

  // 2. PATIENT DEMOGRAPHICS TABLE
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  const colW = contentWidth / 4;

  // Col 1: Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT FULL NAME', margin + 3, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(patient.name, margin + 3, y + 11);

  // Col 2: MRN
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('RECORD / MRN', margin + colW + 3, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(patient.mrn, margin + colW + 3, y + 11);

  // Col 3: Demographics
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('AGE / SEX', margin + colW * 2 + 3, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`${patient.age} Y / ${patient.sex === 'M' ? 'Male' : 'Female'}`, margin + colW * 2 + 3, y + 11);

  // Col 4: Urgency
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CLINICAL PRIORITY', margin + colW * 3 + 3, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(analysis.radiologyReport.urgencyLevel.includes('STAT') ? 225 : 15, 29, 72);
  doc.text(analysis.radiologyReport.urgencyLevel, margin + colW * 3 + 3, y + 11);

  y += 22;

  // 3. SECTION 1: AI CLASSIFICATION & MORPHOMETRY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('1. Deep Learning Classification & Morphometry Summary', margin, y + 4);
  y += 6;

  // Pre-calculate charHeight for dynamic box sizing
  let splitChar: string[] = [];
  let charHeight = 0;
  if (analysis.keyMriDefiningCharacteristic) {
    splitChar = doc.splitTextToSize(analysis.keyMriDefiningCharacteristic, 115);
    charHeight = (splitChar.length - 1) * 3.5;
  }

  // AI Classification Box
  const aiBoxHeight = 52 + charHeight;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, aiBoxHeight, 2, 2, 'FD');

  // Classification Badge & Title
  const hasGlioma = analysis.primaryClassification.toLowerCase().includes('glioma');
  const hasMeningioma = analysis.primaryClassification.toLowerCase().includes('meningioma');
  const hasPituitary = analysis.primaryClassification.toLowerCase().includes('pituitary');

  // Tag color
  if (hasGlioma) {
    doc.setFillColor(254, 226, 226); // rose-100
    doc.setTextColor(159, 18, 57);
  } else if (hasMeningioma) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setTextColor(146, 64, 14);
  } else if (hasPituitary) {
    doc.setFillColor(224, 242, 254); // slate-100
    doc.setTextColor(7, 89, 133);
  } else {
    doc.setFillColor(220, 252, 231); // emerald-100
    doc.setTextColor(22, 101, 52);
  }

  const badgeText = analysis.classLabel || (hasGlioma ? 'Class 1' : hasMeningioma ? 'Class 2' : hasPituitary ? 'Class 3' : 'Class 0');
  doc.roundedRect(margin + 4, y + 4, 20, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(badgeText, margin + 6, y + 7.5);

  doc.setFillColor(226, 232, 240);
  doc.setTextColor(71, 85, 105);
  doc.roundedRect(margin + 26, y + 4, 30, 5, 1, 1, 'F');
  doc.text(analysis.biologicalNature || 'Neoplasm', margin + 28, y + 7.5);

  doc.setFillColor(238, 242, 255);
  doc.setTextColor(67, 56, 202);
  doc.roundedRect(margin + 58, y + 4, 26, 5, 1, 1, 'F');
  doc.text(`WHO ${analysis.whoGrade}`, margin + 60, y + 7.5);

  // Large Classification Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  let titleStr = `${analysis.primaryClassification}: ${analysis.subType}`;
  // Ensure it doesn't overlap the right column
  if (titleStr.length > 55) {
    titleStr = titleStr.substring(0, 52) + '...';
  }
  doc.text(titleStr, margin + 4, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const locText = `Localization: ${analysis.localization.hemisphere} ${analysis.localization.anatomicalLobe} (${analysis.localization.compartment})`;
  doc.text(locText, margin + 4, y + 20);

  if (analysis.keyMriDefiningCharacteristic) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Key MRI Defining Characteristic:', margin + 4, y + 25);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(splitChar, margin + 4, y + 29);
  }

  // Right side: AI Confidence & Thumbnail
  const rightColX = pageWidth - margin - 56;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CADX CONFIDENCE', rightColX, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text(`${analysis.confidenceScore.toFixed(1)}%`, rightColX, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('Softmax Verified', rightColX, y + 18);

  // Draw MRI slice canvas thumbnail if available
  if (keySliceCanvas) {
    try {
      const imgData = keySliceCanvas.toDataURL('image/jpeg', 0.85);
      doc.setFillColor(0, 0, 0);
      doc.roundedRect(pageWidth - margin - 28, y + 4, 25, 25, 1, 1, 'F');
      doc.addImage(imgData, 'JPEG', pageWidth - margin - 27, y + 5, 23, 23);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text('Key Slice (ROI)', pageWidth - margin - 26, y + 32);
    } catch {
      // Fallback if canvas is tainted or cannot export
    }
  }

  // Softmax Probabilities Bars (Inside AI box bottom)
  const probY = y + 36 + charHeight;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('4-Class Softmax Probability Distribution:', margin + 4, probY);

  const probBarStartX = margin + 4;
  const barWidth = 32;
  analysis.classProbabilities.forEach((cp, idx) => {
    const itemX = probBarStartX + idx * 43;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${cp.className.split(' ')[0]}: ${cp.probability.toFixed(0)}%`, itemX, probY + 4);

    // Track
    doc.setFillColor(226, 232, 240);
    doc.rect(itemX, probY + 5.5, barWidth, 2, 'F');

    // Fill
    if (idx === 0) {
      doc.setFillColor(14, 116, 144);
    } else {
      doc.setFillColor(148, 163, 184);
    }
    const fillW = Math.max(1, (cp.probability / 100) * barWidth);
    doc.rect(itemX, probY + 5.5, fillW, 2, 'F');
  });

  y += aiBoxHeight + 4;

  // Morphometry details row
  if (analysis.tumorDetected && analysis.localization.dimensionsMm) {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    const ap = analysis.localization.dimensionsMm.anteriorPosterior || 0;
    const tr = analysis.localization.dimensionsMm.transverse || 0;
    const cc = analysis.localization.dimensionsMm.craniocaudal || 0;
    const vol = analysis.localization.dimensionsMm.estimatedVolumeCm3 || 0;
    const shift = analysis.massEffect?.midlineShiftMm || 0;

    doc.text(`Dimensions: ${ap} x ${tr} x ${cc} mm`, margin + 3, y + 4);
    doc.text(`Estimated Volume: ${vol} cm³`, margin + 48, y + 4);
    doc.text(`Brain Midline Shift: ${shift} mm (${shift > 0 ? 'Present' : 'None'})`, margin + 96, y + 4);
    doc.text(`Herniation Risk: ${analysis.massEffect?.herniationRisk || 'None'}`, margin + 145, y + 4);

    y += 13;
  }

  // 4. SECTION 2: CLINICAL INDICATION & TECHNIQUE
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Clinical Indication & Examination Technique', margin, y + 3);
  y += 5;

  doc.setFont('helvetica', 'normal');
  const indLines = doc.splitTextToSize(analysis.radiologyReport.clinicalIndication, contentWidth - 28);
  const indHeight = (indLines.length - 1) * 3.5;

  const techLines = doc.splitTextToSize(analysis.radiologyReport.technique, contentWidth - 28);
  const techHeight = (techLines.length - 1) * 3.5;

  const section2BoxHeight = 16 + indHeight + techHeight;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, section2BoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('INDICATION: ', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(indLines, margin + 24, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('TECHNIQUE: ', margin + 3, y + 10 + indHeight);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(techLines, margin + 24, y + 10 + indHeight);

  y += section2BoxHeight + 4;

  // 5. SECTION 3: STRUCTURED FINDINGS
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Detailed Structured Anatomical Findings', margin, y + 3);
  y += 5;

  analysis.radiologyReport.findings.forEach((finding) => {
    const descLines = doc.splitTextToSize(finding.description, contentWidth - 8);
    const boxHeight = 8 + descLines.length * 3.5;

    checkPageBreak(boxHeight + 2);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(finding.category, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(descLines, margin + 4, y + 8.5);

    y += boxHeight + 2;
  });

  y += 2;

  // 6. SECTION 4: IMPRESSION & CLINICAL TAKEAWAYS
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Diagnostic Impression & Differential Hierarchy', margin, y + 3);
  y += 5;

  const impLinesAll: string[] = [];
  analysis.radiologyReport.impression.forEach((imp) => {
    impLinesAll.push(imp);
  });

  const impSplit = doc.splitTextToSize(impLinesAll.join('\n\n'), contentWidth - 8);
  const impBoxH = Math.max(16, impSplit.length * 4 + 6);

  checkPageBreak(impBoxH + 4);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, impBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(impSplit, margin + 4, y + 5.5);

  y += impBoxH + 4;

  // 7. SECTION 5: RECOMMENDATIONS
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('5. Recommended Clinical Next Steps & Action Plan', margin, y + 3);
  y += 5;

  const recLinesAll = analysis.radiologyReport.recommendations.map((r) => `• ${r}`);
  const recSplit = doc.splitTextToSize(recLinesAll.join('\n'), contentWidth - 8);
  const recBoxH = Math.max(14, recSplit.length * 4 + 5);

  checkPageBreak(recBoxH + 4);

  doc.setFillColor(254, 243, 199); // amber-50
  doc.setDrawColor(251, 191, 36); // amber-400
  doc.roundedRect(margin, y, contentWidth, recBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15); // amber-900
  doc.text(recSplit, margin + 4, y + 5);

  y += recBoxH + 5;

  // 8. SECTION 6: RADIOLOGIST SIGN-OFF & ATTESTATION
  checkPageBreak(35);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('ATTENDING RADIOLOGIST ATTESTATION & SIGNATURE', margin, y + 2);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(radiologistName, margin, y + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Verified & Filed: ${patient.studyDate || new Date().toISOString().split('T')[0]} · Electronic Auth ID: RAD-AUTH-${patient.mrn}`,
    margin,
    y + 7
  );

  // Digital Signature Seal on right side
  doc.setDrawColor(15, 23, 42);
  doc.line(pageWidth - margin - 60, y + 2, pageWidth - margin, y + 2);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Attending Physician Signature Line', pageWidth - margin - 58, y + 6);

  if (isSigned) {
    y += 10;
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text(`✓ ELECTRONICALLY SIGNED & VALIDATED IN HOSPITAL PACS (${new Date().toLocaleDateString()})`, margin + 3, y + 4.5);
    y += 8;
  } else {
    y += 8;
  }

  // Attending Addendum if provided
  if (radiologistNotes) {
    checkPageBreak(18);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    const addendumSplit = doc.splitTextToSize(`Addendum Note: ${radiologistNotes}`, contentWidth - 8);
    const addH = 6 + addendumSplit.length * 3.5;
    doc.roundedRect(margin, y, contentWidth, addH, 1, 1, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(addendumSplit, margin + 4, y + 4.5);
    y += addH + 3;
  }

  // Finish footer on all pages (only if not appending to existing doc, or we track start page, but for simplicity we'll just add footers to all pages at the end of the batch)
  if (!existingDoc) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }
  }

  return doc;
}

export async function downloadRadiologyReportPDF(options: PDFExportOptions): Promise<{ filename: string; blob: Blob }> {
  const doc = await generateRadiologyReportPDF(options);
  const patientCleanName = options.patient.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Brain_MRI_Report_${options.patient.mrn}_${patientCleanName}.pdf`;

  // Output blob
  const blob = doc.output('blob');

  // Trigger download via anchor element (works in iframes and all browsers without opening blocked popups)
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);

  return { filename, blob };
}

export async function downloadCategoryReportPDF(categoryTitle: string, records: CategoryPatientRecord[]): Promise<{ filename: string; blob: Blob }> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${categoryTitle} - Patient Summary Report`, 14, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  const tableColumn = ["MRN", "Patient Name", "Age/Sex", "Diagnosis", "WHO Grade", "Confidence", "Urgency"];
  const tableRows = records.map(record => [
    record.mrn,
    record.name,
    `${record.age}/${record.sex}`,
    record.diagnosis,
    record.whoGrade,
    `${record.confidence}%`,
    record.urgency
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  const filename = `${categoryTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Summary.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);

  return { filename, blob };
}

export async function downloadBatchFullReportsPDF(categoryTitle: string, records: CategoryPatientRecord[]): Promise<void> {
  const { BENCHMARK_CASES } = await import('../data/benchmarkCases');
  let doc: jsPDF | undefined = undefined;
  
  for (const record of records) {
    const bCase = BENCHMARK_CASES.find(c => c.id === record.id);
    if (bCase) {
      if (doc) doc.addPage();
      doc = await generateRadiologyReportPDF({
        analysis: bCase.defaultAnalysis,
        patient: bCase.patient
      }, doc);
    }
  }

  if (doc) {
    const totalPages = doc.getNumberOfPages();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIAL MEDICAL RECORD · BRAINTUMORAI CADX CLINICAL SYSTEM', margin, pageHeight - 7.5);
      doc.text(`Page ${i}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
    }

    const filename = `${categoryTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Full_Reports.pdf`;
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } else {
    alert('No full report data available for these patients.');
  }
}

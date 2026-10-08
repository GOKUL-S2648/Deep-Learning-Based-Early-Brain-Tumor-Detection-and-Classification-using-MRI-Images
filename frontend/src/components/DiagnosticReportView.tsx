import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Printer,
  Copy,
  Check,
  FileCheck,
  Download,
  FileDown,
  AlertTriangle,
  Stethoscope,
  Award,
  Clock,
  Sparkles,
  Edit3,
  HelpCircle,
  ShieldCheck,
  Building2,
  FileText,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { MRIAnalysisResult, BenchmarkCase } from '../types/radiology';
import { downloadRadiologyReportPDF } from '../utils/pdfExport';

interface DiagnosticReportViewProps {
  analysis: MRIAnalysisResult;
  currentCase?: BenchmarkCase | null;
  customImage?: string | null;
  patientData?: {
    name: string;
    mrn: string;
    age: number;
    sex: string;
    indication: string;
    studyDate: string;
  };
  onConsultRequest?: () => void;
  onBackToWorkstation?: () => void;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({
  analysis,
  currentCase,
  customImage,
  patientData,
  onConsultRequest,
  onBackToWorkstation,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSigned, setIsSigned] = useState(true);
  const [radiologistName, setRadiologistName] = useState('Dr. Marcus Sterling, MD (Neuroradiology)');
  const [radiologistNotes, setRadiologistNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);

  const patient = patientData || currentCase?.patient || {
    name: 'Eleanor Vance',
    mrn: 'RAD-948102',
    age: 61,
    sex: 'F',
    indication: 'Progressive left hemiparesis and new adult-onset seizure.',
    studyDate: '2026-08-14',
  };

  const {
    tumorDetected,
    classLabel,
    biologicalNature,
    keyMriDefiningCharacteristic,
    primaryClassification,
    subType,
    whoGrade,
    confidenceScore,
    classProbabilities,
    localization,
    massEffect,
    differentialDiagnoses,
    radiologyReport,
  } = analysis;

  // Render key MRI scan slice with localization bounding box on canvas
  useEffect(() => {
    const canvas = thumbnailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (customImage || currentCase?.imageSrc) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (tumorDetected && localization?.boundingBox) {
          const { xmin, ymin, xmax, ymax } = localization.boundingBox;
          const bx = (xmin / 100) * canvas.width;
          const by = (ymin / 100) * canvas.height;
          const bw = ((xmax - xmin) / 100) * canvas.width;
          const bh = ((ymax - ymin) / 100) * canvas.height;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(bx, by, bw, bh);
        }
      };
      img.src = customImage || currentCase?.imageSrc || '';
    } else if (currentCase?.imageGenerator) {
      currentCase.imageGenerator(ctx, canvas.width, canvas.height, 'grayscale', 140, 60);
      if (tumorDetected && localization?.boundingBox) {
        const { xmin, ymin, xmax, ymax } = localization.boundingBox;
        const bx = (xmin / 100) * canvas.width;
        const by = (ymin / 100) * canvas.height;
        const bw = ((xmax - xmin) / 100) * canvas.width;
        const bh = ((ymax - ymin) / 100) * canvas.height;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx, by, bw, bh);
      }
    }
  }, [customImage, currentCase, tumorDetected, localization?.boundingBox]);

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      setExportSuccessMessage(null);

      const { filename } = await downloadRadiologyReportPDF({
        analysis,
        patient,
        keySliceCanvas: thumbnailCanvasRef.current,
        radiologistName,
        radiologistNotes,
        isSigned,
      });

      setExportSuccessMessage(filename);
      setTimeout(() => {
        setExportSuccessMessage(null);
      }, 7000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      // Fallback attempt
      try {
        window.print();
      } catch (printErr) {
        console.warn('Window print also blocked:', printErr);
      }
    } finally {
      setIsExporting(false);
    }
  }, [analysis, patient, radiologistName, radiologistNotes, isSigned, isExporting]);

  // Listen for the global export event from App.tsx header button
  useEffect(() => {
    const handleGlobalExport = () => {
      handleExportPDF();
    };
    window.addEventListener('export-radiology-pdf', handleGlobalExport);
    return () => {
      window.removeEventListener('export-radiology-pdf', handleGlobalExport);
    };
  }, [handleExportPDF]);

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleExportPDF();
    }
  };

  const handleCopyReport = () => {
    const findingsText = radiologyReport.findings
      .map((f) => `• ${f.category.toUpperCase()}: ${f.description}`)
      .join('\n');
    const impressionText = radiologyReport.impression.map((imp) => imp).join('\n');
    const recsText = radiologyReport.recommendations.map((r) => `• ${r}`).join('\n');

    const fullText = `ACADEMIC NEURORADIOLOGY IMAGING CENTER
MRI BRAIN DIAGNOSTIC REPORT (DEEP LEARNING CADx ASSISTED)
======================================================
PATIENT NAME: ${patient.name}
MRN: ${patient.mrn} | AGE/SEX: ${patient.age}${patient.sex}
DATE OF EXAMINATION: ${patient.studyDate}
EXAMINATION: ${radiologyReport.examType}
CLINICAL INDICATION: ${radiologyReport.clinicalIndication}

AI CLASSIFICATION & MORPHOMETRY:
- Diagnostic Category: ${primaryClassification} (${subType})
- WHO CNS Grade: ${whoGrade}
- Deep Learning Confidence: ${confidenceScore.toFixed(1)}%
- Anatomical Localization: ${localization.hemisphere} ${localization.anatomicalLobe} (${localization.compartment})
- Dimensions: ${localization.dimensionsMm?.anteriorPosterior || 0} x ${localization.dimensionsMm?.transverse || 0} x ${localization.dimensionsMm?.craniocaudal || 0} mm (Vol: ${localization.dimensionsMm?.estimatedVolumeCm3 || 0} cm³)
- Mass Effect: ${massEffect?.present ? `Present (${massEffect.midlineShiftMm} mm midline shift)` : 'None'}

TECHNIQUE:
${radiologyReport.technique}

FINDINGS:
${findingsText}

IMPRESSION:
${impressionText}

RECOMMENDATIONS:
${recsText}

STATUS: ${isSigned ? `FINAL SIGNED - ${radiologistName}` : 'PRELIMINARY AI CADx REPORT'}
${radiologistNotes ? `ATTENDING ADDENDUM: ${radiologistNotes}` : ''}
`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-800 max-w-5xl mx-auto w-full">
      {/* Friendly Guide Banner */}
      <div className="no-print p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Automated Clinical Diagnostic Report</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-indigo-200">
                Print & Export Ready
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">
              Structured neuroradiology diagnostic report with deep learning classification, morphometry, and attending sign-off.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onBackToWorkstation && (
            <button
              onClick={onBackToWorkstation}
              className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Workstation</span>
            </button>
          )}

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Full Text'}</span>
          </button>

          {/* Primary User-Requested Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-75 rounded-xl transition-all shadow-md shadow-blue-900/40 cursor-pointer text-slate-900"
            title="Generate and download a professional clinical diagnostic PDF for the current patient record"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>

          {/* Quick Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Print report via browser print dialog"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {exportSuccessMessage && (
        <div className="no-print p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-200 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Clinical Diagnostic PDF Exported Successfully!</span>
              <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                File: {exportSuccessMessage} (saved to your downloads)
              </div>
            </div>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-400 hover:text-slate-900 px-2 py-1 text-xs rounded hover:bg-emerald-900/50 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Report Document Sheet */}
      <div className="report-sheet bg-white/90 border border-slate-200 rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:bg-white print:text-slate-900 space-y-6 shadow-xl w-full">
        {/* Document Institutional Header */}
        <div className="border-b border-slate-200 print:border-slate-300 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase font-mono tracking-widest text-slate-500 print:text-slate-950 font-bold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 hidden print:inline-block" />
                <span>ACADEMIC MEDICAL CENTER · DEPARTMENT OF NEURORADIOLOGY</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Brain MRI Diagnostic Radiology Report
              </h1>
              <div className="text-xs text-slate-500 print:text-slate-600 mt-0.5">
                Deep Learning CADx Classification & Structural Morphometry Assessment
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono text-xs text-slate-500 print:text-slate-700">
                <div className="text-sm font-semibold text-slate-700 print:text-slate-900">MRN: {patient.mrn}</div>
                <div>EXAM DATE: {patient.studyDate}</div>
                <div>
                  STATUS:{' '}
                  <strong
                    className={
                      isSigned
                        ? 'text-emerald-400 print:text-emerald-800 font-bold'
                        : 'text-amber-400 print:text-amber-800'
                    }
                  >
                    {isSigned ? 'FINAL / VERIFIED' : 'PRELIMINARY AI DRAFT'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Demographics Chart */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 print:bg-slate-100 rounded-xl border border-slate-200 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[11px]">Patient Full Name</span>
              <span className="font-bold text-slate-900">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[11px]">Record / MRN</span>
              <span className="font-bold text-slate-900 font-mono">{patient.mrn}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[11px]">Demographics</span>
              <span className="font-bold text-slate-900">
                {patient.age} Y / {patient.sex === 'M' ? 'Male' : 'Female'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[11px]">Clinical Priority</span>
              <span
                className={`font-bold ${
                  radiologyReport.urgencyLevel.includes('STAT')
                    ? 'text-rose-400 print:text-rose-700'
                    : 'text-amber-400 print:text-amber-700'
                }`}
              >
                {radiologyReport.urgencyLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: AI Classification & Morphometry Summary */}
        <div className="space-y-4 print-avoid-break">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 print:text-slate-900">
            <Award className="w-4 h-4" />
            <span>1. Deep Learning Classification & Tumor Morphometry</span>
          </div>

          <div className="p-5 bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-300 rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border ${
                      classLabel === 'Class 1' || primaryClassification.toLowerCase().includes('glioma')
                        ? 'bg-rose-500/20 text-rose-700 border-rose-500/40 print:bg-rose-100 print:text-rose-900 print:border-rose-300'
                        : classLabel === 'Class 2' || primaryClassification.toLowerCase().includes('meningioma')
                        ? 'bg-amber-500/20 text-amber-700 border-amber-500/40 print:bg-amber-100 print:text-amber-900 print:border-amber-300'
                        : classLabel === 'Class 3' || primaryClassification.toLowerCase().includes('pituitary')
                        ? 'bg-slate-500/20 text-slate-600 border-slate-500/40 print:bg-slate-100 print:text-slate-900 print:border-slate-300'
                        : 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300'
                    }`}
                  >
                    {classLabel ||
                      (primaryClassification.toLowerCase().includes('glioma')
                        ? 'Class 1'
                        : primaryClassification.toLowerCase().includes('meningioma')
                        ? 'Class 2'
                        : primaryClassification.toLowerCase().includes('pituitary')
                        ? 'Class 3'
                        : 'Class 0')}
                  </span>
                  {biologicalNature && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 print:bg-slate-200 print:text-slate-800">
                      {biologicalNature}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-50/60 text-slate-600 border border-black/40 print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                    WHO {whoGrade}
                  </span>
                </div>

                <div className="text-xl font-bold text-slate-900 tracking-tight">
                  {primaryClassification}: {subType}
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-white/60 print:bg-slate-100 rounded-lg border border-slate-300/50 print:border-slate-300">
                  <div>
                    <span className="text-slate-500 print:text-slate-600 block text-[10px] uppercase font-mono mb-1">Tumor Type</span>
                    <span className="font-bold text-slate-900 text-xs">{subType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 block text-[10px] uppercase font-mono mb-1">Tumor Category</span>
                    <span className="font-bold text-slate-900 text-xs">{biologicalNature} (WHO {whoGrade})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 block text-[10px] uppercase font-mono mb-1">Localization</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {localization.hemisphere} {localization.anatomicalLobe} ({localization.compartment})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 print:text-slate-600 block text-[10px] uppercase font-mono mb-1">Primary Treatment</span>
                    <span className="font-bold text-indigo-600 print:text-slate-900 text-xs leading-tight line-clamp-2" title={radiologyReport.recommendations[0] || 'N/A'}>
                      {radiologyReport.recommendations[0] || 'See Next Steps'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence badge + MRI Key Slice Thumbnail for printed reports */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-xs text-slate-500 print:text-slate-600 uppercase font-mono block">
                    CADx Confidence
                  </span>
                  <div className="text-2xl font-mono font-bold text-indigo-600 print:text-slate-900">
                    {confidenceScore.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-emerald-400 print:text-emerald-800 font-medium">
                    Softmax Verified
                  </span>
                </div>

                {/* MRI Key Slice Snapshot */}
                <div className="flex flex-col items-center bg-white print:bg-slate-50 p-1.5 rounded-xl border border-slate-200 print:border-slate-300">
                  <canvas
                    ref={thumbnailCanvasRef}
                    width={112}
                    height={112}
                    className="rounded-lg w-20 h-20 sm:w-24 sm:h-24 object-contain bg-white shadow-inner"
                  />
                  <span className="text-[9px] font-mono text-slate-600 print:text-slate-700 mt-1 font-semibold">
                    Key Slice (ROI)
                  </span>
                </div>
              </div>
            </div>

            {/* Key MRI Defining Characteristic Callout */}
            {keyMriDefiningCharacteristic && (
              <div className="p-3 bg-white/90 print:bg-slate-100 rounded-lg border border-slate-200 print:border-slate-300 text-xs">
                <span className="text-slate-500 print:text-slate-600 font-bold uppercase tracking-wider text-[10px] font-mono block mb-0.5">
                  Key MRI Defining Characteristic:
                </span>
                <p className="text-slate-700 print:text-slate-900 font-medium leading-relaxed">
                  {keyMriDefiningCharacteristic}
                </p>
              </div>
            )}

            {/* Differential Probabilities */}
            <div className="space-y-2 pt-3 border-t border-slate-200/80 print:border-slate-300">
              <span className="text-xs font-medium text-slate-600 print:text-slate-800">
                4-Class Softmax Probability Distribution:
              </span>
              <div className="space-y-2">
                {classProbabilities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {item.classLabel && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 print:bg-slate-200 text-slate-600 print:text-slate-800">
                        {item.classLabel}
                      </span>
                    )}
                    <span className="w-44 truncate text-slate-600 print:text-slate-800 font-medium">
                      {item.className}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 print:bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-cyan-500 print:bg-white'
                            : 'bg-slate-600 print:bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(2, item.probability)}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-600 print:text-slate-800 font-mono font-semibold">
                      {item.probability.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tumor Morphometry & Measurements */}
            {tumorDetected && localization.dimensionsMm && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 print:border-slate-300 text-xs">
                <div>
                  <span className="text-slate-500 print:text-slate-600 block text-[11px]">Size (AP x TR)</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {localization.dimensionsMm.anteriorPosterior} x {localization.dimensionsMm.transverse} mm
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 print:text-slate-600 block text-[11px]">Estimated Volume</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {localization.dimensionsMm.estimatedVolumeCm3} cm³
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 print:text-slate-600 block text-[11px]">Brain Midline Shift</span>
                  <span
                    className={`font-bold font-mono ${
                      (massEffect?.midlineShiftMm || 0) > 5
                        ? 'text-rose-400 print:text-rose-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {massEffect?.midlineShiftMm || 0} mm ({massEffect?.midlineShiftMm ? 'Present' : 'None'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 print:text-slate-600 block text-[11px]">Herniation Risk</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {massEffect?.herniationRisk || 'None'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Clinical Indication */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 print:text-slate-900">
            <Stethoscope className="w-4 h-4" />
            <span>2. Clinical Indication & Examination Technique</span>
          </div>

          <div className="text-xs space-y-2 text-slate-600 print:text-slate-800 leading-relaxed bg-slate-50/40 print:bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 print:border-slate-300">
            <div>
              <strong className="text-slate-900 uppercase font-mono mr-2">Indication:</strong>
              <span>{radiologyReport.clinicalIndication}</span>
            </div>
            <div>
              <strong className="text-slate-900 uppercase font-mono mr-2">Technique:</strong>
              <span>{radiologyReport.technique}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Anatomical Findings */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 print:text-slate-900">
            <Clock className="w-4 h-4" />
            <span>3. Detailed Anatomical Findings</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 print:text-slate-800">
            {radiologyReport.findings.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/40 print:bg-slate-50 rounded-xl border border-slate-200/60 print:border-slate-300"
              >
                <div className="font-bold text-cyan-300 print:text-slate-900 mb-1">
                  {f.category}
                </div>
                <p className="leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Impression */}
        <div className="space-y-3 pt-3 border-t border-slate-200 print:border-slate-300 print-avoid-break">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
            IMPRESSION & CLINICAL TAKEAWAYS:
          </div>

          <div className="p-4 bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-300 rounded-xl space-y-2">
            {radiologyReport.impression.map((imp, idx) => (
              <div key={idx} className="text-xs font-medium text-slate-700 print:text-slate-900 leading-relaxed">
                {imp}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Recommendations */}
        <div className="space-y-3 print-avoid-break">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span>RECOMMENDED CLINICAL NEXT STEPS:</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 print:text-slate-800 list-disc list-inside">
            {radiologyReport.recommendations.map((rec, idx) => (
              <li key={idx} className="leading-relaxed font-medium">
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 6: Attending Radiologist Sign-Off */}
        <div className="pt-6 border-t border-slate-200 print:border-slate-300 space-y-4 print-avoid-break">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 print:text-slate-600 block">
                Attending Radiologist Sign-off
              </span>
              <div className="text-sm font-bold text-slate-900">{radiologistName}</div>
              <div className="text-xs text-slate-500 print:text-slate-600 font-mono">
                Verified: {new Date().toLocaleDateString()} · Electronic Verification ID: RAD-AUTH-{patient.mrn}
              </div>
            </div>

            <div className="no-print flex items-center gap-3">
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{radiologistNotes ? 'Edit Notes' : 'Add Doctor Notes'}</span>
              </button>

              <button
                onClick={() => setIsSigned(!isSigned)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer ${
                  isSigned
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isSigned ? 'Report Signed & Approved' : 'Sign & Approve Report'}</span>
              </button>
            </div>

            {/* Print-only signature and date line */}
            <div className="hidden print:block text-right">
              <div className="w-52 border-b border-slate-200 mb-1"></div>
              <span className="text-[10px] text-slate-600 font-mono">
                Attending Physician Signature & Timestamp
              </span>
            </div>
          </div>

          {/* Addendum editor */}
          {(isEditingNotes || radiologistNotes) && (
            <div className="p-3.5 bg-slate-50 print:bg-slate-50 border border-slate-200 print:border-slate-300 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-600 print:text-slate-900 uppercase">
                Doctor Note / Surgical Addendum:
              </span>
              {isEditingNotes ? (
                <div className="space-y-2 no-print">
                  <textarea
                    value={radiologistNotes}
                    onChange={(e) => setRadiologistNotes(e.target.value)}
                    placeholder="Enter additional clinical notes or surgical caveats..."
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1 bg-cyan-600 text-slate-900 text-xs font-semibold rounded-lg hover:bg-cyan-500 cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 print:text-slate-800 italic leading-relaxed">
                  {radiologistNotes}
                </p>
              )}
            </div>
          )}

          {isSigned && (
            <div className="p-3 bg-emerald-950/40 print:bg-emerald-50 border border-emerald-500/40 print:border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-700 print:text-emerald-900 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                <span>ELECTRONICALLY SIGNED AND FILED IN HOSPITAL PACS: {radiologistName}</span>
              </div>
              <span className="text-[11px]">{new Date().toISOString()}</span>
            </div>
          )}
        </div>

        {/* Hospital Document Legal & Quality Footer */}
        <div className="pt-4 border-t border-slate-200/80 print:border-slate-300 text-[10px] text-slate-500 print:text-slate-600 flex flex-wrap items-center justify-between gap-2 font-mono print-avoid-break">
          <div>
            CONFIDENTIAL MEDICAL RECORD · FOR CLINICAL NEURO-ONCOLOGY & NEUROSURGERY CARE ONLY
          </div>
          <div>
            BrainTumorAI CADx v2.4 · Formulated per ACR/RSNA Neuroradiology Reporting Standards
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Layers, FileText, Eye, Download, AlertTriangle, Info, CheckCircle2, Trash2, AlertCircle, X } from 'lucide-react';
import { downloadCategoryReportPDF, downloadBatchFullReportsPDF } from '../../utils/pdfExport';

interface PatientRecord {
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

interface PatientCategoryViewProps {
  records: PatientRecord[];
  onSelectCase: (caseId: string) => void;
  onOpenReport: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
  userName?: string;
}

export const PatientCategoryView: React.FC<PatientCategoryViewProps> = ({
  records,
  onSelectCase,
  onOpenReport,
  onDeleteCase,
  userName = 'Dr. Marcus Sterling, MD (Neuroradiology)',
}) => {
  const [selectedRisk, setSelectedRisk] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [caseToDelete, setCaseToDelete] = useState<PatientRecord | null>(null);

  const { categories, riskGroups } = useMemo(() => {
    const tumorGroups: Record<string, { title: string, color: string, records: PatientRecord[] }> = {
      'Class 1': { title: 'Glioma (Malignant / Infiltrative)', color: 'bg-rose-50 text-rose-700 border-rose-200', records: [] },
      'Class 2': { title: 'Meningioma (Typically Benign)', color: 'bg-amber-50 text-amber-700 border-amber-200', records: [] },
      'Class 3': { title: 'Pituitary Tumor (Benign Adenoma)', color: 'bg-slate-50 text-slate-700 border-slate-200', records: [] },
      'Class 0': { title: 'No Tumor (Healthy / Normal)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', records: [] },
      'Other': { title: 'Unclassified / Pending', color: 'bg-slate-50 text-slate-700 border-slate-200', records: [] },
    };

    const riskGroups: Record<'High' | 'Medium' | 'Low', PatientRecord[]> = {
      'High': [],
      'Medium': [],
      'Low': []
    };

    records.forEach(record => {
      const isHigh = record.classLabel === 'Class 1';
      const isMedium = record.classLabel === 'Class 2' || record.classLabel === 'Class 3';
      const isLow = record.classLabel === 'Class 0';

      if (isHigh) riskGroups['High'].push(record);
      else if (isMedium) riskGroups['Medium'].push(record);
      else if (isLow) riskGroups['Low'].push(record);

      let shouldInclude = true;
      if (selectedRisk === 'High' && !isHigh) shouldInclude = false;
      if (selectedRisk === 'Medium' && !isMedium) shouldInclude = false;
      if (selectedRisk === 'Low' && !isLow) shouldInclude = false;

      if (shouldInclude) {
        if (record.classLabel && tumorGroups[record.classLabel]) {
          tumorGroups[record.classLabel].records.push(record);
        } else {
          tumorGroups['Other'].records.push(record);
        }
      }
    });

    return { 
      categories: Object.values(tumorGroups).filter(g => g.records.length > 0),
      riskGroups
    };
  }, [records, selectedRisk]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Patient Categorization
              {selectedRisk !== 'All' && <span className="ml-3 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Filtering: {selectedRisk} Risk</span>}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review patient studies organized by primary defect and tumor type classification.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.map((category, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className={`px-5 py-3 border-b border-slate-100 flex items-center justify-between ${category.color.split(' ')[0]}`}>
              <div className="flex items-center gap-2">
                <Layers className={`w-4 h-4 ${category.color.split(' ')[1]}`} />
                <h2 className={`font-bold text-sm ${category.color.split(' ')[1]}`}>
                  {category.title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadBatchFullReportsPDF(category.title, category.records as any, userName)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white/60 hover:bg-white/90 rounded transition-colors ${category.color.split(' ')[1]}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Reports</span>
                </button>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${category.color.split(' ')[1]}`}>
                  {category.records.length} {category.records.length === 1 ? 'Patient' : 'Patients'}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {category.records.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900 truncate">{item.name}</span>
                      <span className="text-xs font-mono text-slate-500">{item.mrn}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${category.color}`}>
                        {item.whoGrade}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 truncate">
                      {item.diagnosis}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {item.indication}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectCase(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                    <button
                      onClick={() => onOpenReport(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                    
                    {onDeleteCase && (
                      <button
                        onClick={() => setCaseToDelete(item)}
                        className="flex items-center justify-center w-8 h-8 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors ml-1 border border-rose-100"
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
            No categorized patient records available.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-sm w-full font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">Delete Patient Record</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Are you sure you want to permanently delete the medical record and analysis data for <strong className="text-slate-700">{caseToDelete.name}</strong> ({caseToDelete.mrn})? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setCaseToDelete(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (onDeleteCase) onDeleteCase(caseToDelete.id);
                      setCaseToDelete(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-md shadow-rose-600/20"
                  >
                    Delete Record
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setCaseToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

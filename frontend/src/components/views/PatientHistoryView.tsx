import React, { useState } from 'react';
import { DatePicker } from '../ui/DatePicker';
import { format, isSameDay } from 'date-fns';
import { 
  History, 
  Search, 
  FileText, 
  Eye, 
  Printer, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  Trash2,
  X
} from 'lucide-react';

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

interface PatientHistoryViewProps {
  records: PatientRecord[];
  onSelectCase: (caseId: string) => void;
  onOpenReport: (caseId: string) => void;
  onDeleteCase?: (caseId: string) => void;
}

export const PatientHistoryView: React.FC<PatientHistoryViewProps> = ({
  records,
  onSelectCase,
  onOpenReport,
  onDeleteCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'malignant' | 'benign'>('all');
  const [caseToDelete, setCaseToDelete] = useState<PatientRecord | null>(null);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'malignant') return matchesSearch && r.whoGrade === 'Grade IV';
    if (filterType === 'benign') return matchesSearch && r.whoGrade !== 'Grade IV';
    return matchesSearch;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const dateFiltered = selectedDate 
    ? filtered.filter(r => isSameDay(new Date(r.date), selectedDate))
    : filtered;

  // Sort records by date descending so newest (September) comes before older (August)
  const sortedRecords = [...dateFiltered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const groupedRecords: { monthYear: string; records: PatientRecord[] }[] = [];
  sortedRecords.forEach(r => {
    const monthYear = format(new Date(r.date), 'MMMM yyyy');
    const existingGroup = groupedRecords.find(g => g.monthYear === monthYear);
    if (existingGroup) {
      existingGroup.records.push(r);
    } else {
      groupedRecords.push({ monthYear, records: [r] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[2.75rem] font-serif text-[#171f3a] tracking-tight leading-tight mb-2">
          Patient Records & Study Archive
        </h1>
        <p className="text-sm text-slate-500">
          Review historical brain MRI evaluations, AI classifications, and diagnostic reports.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-full px-5 py-3 shadow-sm border border-slate-200/60 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, or tumor diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Filter by Date</span>
          </button>
          
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-slate-500 mr-1">Filter:</span>
            {(['all', 'malignant', 'benign'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  filterType === type
                    ? 'bg-[#3b82f6] text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Scans' : type === 'malignant' ? 'High-Grade' : 'Benign / Normal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Patient / MRN</th>
                <th className="p-4">Age / Sex</th>
                <th className="p-4">Date</th>
                <th className="p-4">AI Diagnostic Classification</th>
                <th className="p-4">WHO Grade</th>
                <th className="p-4 text-center">Confidence</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedRecords.map(({ monthYear, records: groupRecords }) => (
                <React.Fragment key={monthYear}>
                  <tr>
                    <td colSpan={7} className="px-6 pt-8 pb-3 text-[11px] font-black text-slate-700 tracking-widest uppercase">
                      {monthYear}
                    </td>
                  </tr>
                  {groupRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.mrn}</div>
                      </td>

                      <td className="p-4 text-slate-700 font-medium">
                        {item.age} Y / {item.sex}
                      </td>

                      <td className="p-4 text-slate-500 font-mono">
                        {item.date}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          {item.classLabel && (
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                              item.classLabel === 'Class 1' ? 'bg-rose-100 text-rose-800' :
                              item.classLabel === 'Class 2' ? 'bg-amber-100 text-amber-800' :
                              item.classLabel === 'Class 3' ? 'bg-slate-100 text-slate-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.classLabel}
                            </span>
                          )}
                          {item.biologicalNature && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {item.biologicalNature}
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900">{item.diagnosis}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{item.indication}</div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.whoGrade === 'Grade IV'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : item.whoGrade === 'Grade I'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          {item.whoGrade}
                        </span>
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-slate-700">
                        {item.confidence}%
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectCase(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Workstation</span>
                          </button>

                          <button
                            onClick={() => onOpenReport(item.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>
                          
                          {onDeleteCase && (
                            <button
                              onClick={() => setCaseToDelete(item)}
                              className="flex items-center justify-center w-8 h-8 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors ml-1"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
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

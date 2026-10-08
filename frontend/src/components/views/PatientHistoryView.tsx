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
  Filter
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
}

export const PatientHistoryView: React.FC<PatientHistoryViewProps> = ({
  records,
  onSelectCase,
  onOpenReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'malignant' | 'benign'>('all');

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Patient Records & Study Archive
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review historical brain MRI evaluations, AI classifications, and diagnostic reports.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, or tumor diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-slate-200 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
          
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium hidden sm:inline">Filter:</span>
            {(['all', 'malignant', 'benign'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white shadow-sm'
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
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Patient / MRN</th>
                <th className="p-4">Age / Sex</th>
                <th className="p-4">Date</th>
                <th className="p-4">AI Diagnostic Classification</th>
                <th className="p-4">WHO Grade</th>
                <th className="p-4 text-center">Confidence</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedRecords.map(({ monthYear, records: groupRecords }) => (
                <React.Fragment key={monthYear}>
                  <tr className="bg-slate-100/50 border-y border-slate-200">
                    <td colSpan={7} className="px-4 py-2 text-xs font-bold text-slate-700 tracking-wide uppercase">
                      {monthYear}
                    </td>
                  </tr>
                  {groupRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
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

                      <td className="p-4 text-right">
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
    </div>
  );
};

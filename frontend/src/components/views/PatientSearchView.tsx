import React, { useState } from 'react';
import { Search, UserCheck, Eye, FileText, Calendar, ArrowRight, Trash2, AlertCircle, X } from 'lucide-react';

interface PatientItem {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: string;
  date: string;
  diagnosis: string;
  whoGrade: string;
  confidence: number;
  tumorDetected: boolean;
}

interface PatientSearchViewProps {
  patients: PatientItem[];
  onSelectPatient: (patientId: string) => void;
  onOpenReport: (patientId: string) => void;
  onDeletePatient?: (patientId: string) => void;
}

export const PatientSearchView: React.FC<PatientSearchViewProps> = ({
  patients,
  onSelectPatient,
  onOpenReport,
  onDeletePatient,
}) => {
  const [query, setQuery] = useState('');
  const [caseToDelete, setCaseToDelete] = useState<PatientItem | null>(null);

  const results = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.mrn.toLowerCase().includes(query.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Consultation Records
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quickly retrieve past MRI analyses and digital reports for patient consultations.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            autoFocus
            placeholder="Type patient name (e.g. Eleanor Vance) or MRN (e.g. RAD-948102)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-slate-200 focus:bg-white shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold">Quick Search:</span>
          {patients.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => setQuery(p.name)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
          Search Results ({results.length} Found)
        </div>

        {results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            <p className="text-sm font-semibold text-slate-600">No patient found matching "{query}"</p>
            <p className="text-xs text-slate-500 mt-1">Check spelling or try searching by MRN number</p>
          </div>
        ) : (
          results.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-bold flex items-center justify-center text-sm shrink-0">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {patient.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {patient.age} Y / {patient.sex} · Examined on {patient.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900">{patient.diagnosis}</div>
                  <div className="text-[11px] text-slate-500">WHO {patient.whoGrade} · {patient.confidence}% Confidence</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatient(patient.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Workstation</span>
                  </button>

                  <button
                    onClick={() => onOpenReport(patient.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>

                  {onDeletePatient && (
                    <button
                      onClick={() => setCaseToDelete(patient)}
                      className="flex items-center justify-center w-8 h-8 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors ml-1"
                      title="Delete Patient Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
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
                      if (onDeletePatient) onDeletePatient(caseToDelete.id);
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

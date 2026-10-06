import React, { useState } from 'react';
import { Search, UserCheck, Eye, FileText, Calendar, ArrowRight } from 'lucide-react';

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
}

export const PatientSearchView: React.FC<PatientSearchViewProps> = ({
  patients,
  onSelectPatient,
  onOpenReport,
}) => {
  const [query, setQuery] = useState('');

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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

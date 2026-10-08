import React, { useMemo, useState } from 'react';
import {
  Activity,
  FileText,
  AlertCircle,
  Users,
  ArrowUpRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  Brain,
  ScanLine,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

import { downloadBatchFullReportsPDF } from '../../utils/pdfExport';

interface OverviewViewProps {
  records?: any[];
  userName?: string;
  userRole?: string;

  totalAnalyses: number;
  todaysReports: number;
  malignantCases: number;
  totalPatients: number;

  recentAnalyses: Array<{
    id: string;
    patientName: string;
    mrn: string;
    diagnosis: string;
    confidence: number;
    urgency: string;
    date: string;
    tumorDetected: boolean;
  }>;

  onNavigate: (page: any) => void;
  onSelectCase: (caseId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  records = [],
  userName = 'User',
  userRole = 'admin',

  totalAnalyses = 4,
  todaysReports = 4,
  malignantCases = 2,
  totalPatients = 4,

  recentAnalyses = [],

  onNavigate,
  onSelectCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const filteredStudies = useMemo(() => {
    return recentAnalyses.filter(item => {
      const matchesSearch = item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      
      let itemRisk = 'Low';
      const diag = item.diagnosis.toLowerCase();
      const urg = (item.urgency || '').toLowerCase();
      
      if (diag.includes('glioma') || urg.includes('emergent') || urg.includes('stat') || diag.includes('metastasis')) {
         itemRisk = 'High';
      } else if (diag.includes('meningioma') || diag.includes('pituitary') || urg.includes('priority')) {
         itemRisk = 'Medium';
      } else if (item.tumorDetected) {
         itemRisk = 'High'; 
      }
      
      if (riskFilter !== 'All' && itemRisk !== riskFilter) return false;
      return matchesSearch;
    });
  }, [recentAnalyses, searchQuery, riskFilter]);

  /* =========================================================
     RISK GROUPING
     ========================================================= */

  const riskGroups = useMemo(() => {
    const groups: Record<'High' | 'Medium' | 'Low', any[]> = {
      High: [],
      Medium: [],
      Low: [],
    };

    records.forEach((record) => {
      if (record.classLabel === 'Class 1') {
        groups.High.push(record);
      } else if (
        record.classLabel === 'Class 2' ||
        record.classLabel === 'Class 3'
      ) {
        groups.Medium.push(record);
      } else if (record.classLabel === 'Class 0') {
        groups.Low.push(record);
      }
    });

    return groups;
  }, [records]);

  /* =========================================================
     STATISTICS
     ========================================================= */

  const malignantRate =
    totalAnalyses > 0
      ? ((malignantCases / totalAnalyses) * 100).toFixed(0)
      : '0';

  const stats = [
    {
      title: 'Total Analyses',
      value: totalAnalyses,
      badge: totalAnalyses > 0 ? 'ACTIVE' : 'NO DATA',
      icon: Activity,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      iconBorder: 'border-blue-100',
    },

    {
      title: 'Malignant Cases',
      value: malignantCases,
      badge: `${malignantRate}%`,
      icon: AlertCircle,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      iconBorder: 'border-violet-100',
    },
    {
      title: 'Registered Patients',
      value: totalPatients,
      badge: 'TOTAL',
      icon: Users,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      iconBorder: 'border-teal-100',
    },
  ];

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="neuro-overview space-y-7">

      {/* =====================================================
          WELCOME HEADER
          ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-[#DCE6F0] bg-white px-6 py-6 sm:px-8 sm:py-7 shadow-[0_10px_35px_rgba(37,99,235,0.05)]">

        {/* Decorative gradients */}
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-24 h-52 w-52 rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                AI Imaging Workspace
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.035em] text-[#172554]">
              Welcome, {userName}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Here is what's happening in your department today.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-[#DCE6F0] bg-[#F8FBFF] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-600 shadow-sm">
              <Brain className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                NeuroScan AI
              </p>

              <p className="mt-0.5 text-xs font-semibold text-[#172033]">
                MRI Analysis Ready
              </p>
            </div>

            <span className="ml-2 h-2 w-2 rounded-full bg-[#0F9F9A]" />
          </div>

        </div>
      </section>


      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-5">

        {stats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={idx}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#DCE6F0]
                bg-white
                p-5
                sm:p-6
                shadow-[0_8px_25px_rgba(37,99,235,0.045)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_16px_35px_rgba(37,99,235,0.10)]
              "
              onClick={() => {
                if (stat.title === 'Total Analyses') {
                  onNavigate('patient_search');
                } else if (stat.title === 'Registered Patients') {
                  onNavigate('patient_history');
                }
              }}
              style={{ cursor: (stat.title === 'Total Analyses' || stat.title === 'Registered Patients') ? 'pointer' : 'default' }}
            >

              {/* Card accent */}
              <div
                className={`absolute left-0 top-0 h-full w-1 ${
                  idx === 0
                    ? 'bg-blue-500'
                    : idx === 1
                    ? 'bg-cyan-500'
                    : idx === 2
                    ? 'bg-violet-500'
                    : 'bg-teal-500'
                }`}
              />

              <div className="flex items-start justify-between">

                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    ${stat.iconBg}
                    ${stat.iconBorder}
                    ${stat.iconColor}
                    transition-all
                    duration-300
                    group-hover:scale-105
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="rounded-full border border-[#DCE6F0] bg-[#F8FAFC] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#64748B]">
                  {stat.badge}
                </span>

              </div>

              <div className="mt-5">

                <p className="text-xs font-semibold text-[#64748B]">
                  {stat.title}
                </p>

                <div className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#172554]">
                  {stat.value}
                </div>

              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-[#94A3B8]">
                <Activity className="h-3 w-3" />
                NeuroScan workspace
              </div>

            </div>
          );
        })}

      </section>




      {/* =====================================================
          RISK ASSESSMENT FACTORS
          ===================================================== */}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#172554]">
              Risk Assessment Factors
            </h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Clinical criteria and case distributions based on AI analysis
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-[#64748B]">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            AI Insights
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* High Risk */}
          <div className="group relative overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-[0_4px_20px_rgba(225,29,72,0.04)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.08)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 text-rose-700">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-[#172033]">High Risk</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Priority 1</p>
                  </div>
                </div>
                <div className="text-3xl font-black tracking-tighter text-rose-600">{riskGroups.High.length}</div>
              </div>
              
              <div className="mb-6 rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0]">
                <p className="text-xs font-medium leading-relaxed text-[#475569]">
                  Immediate clinical attention required. High probability of aggressive pathology or acute conditions.
                </p>
              </div>
              
              <div className="space-y-3 mb-7">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Malignant Neoplasms (Glioma, Mets)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Significant Mass Effect / Shift</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Acute Hemorrhage / Hydrocephalus</span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadBatchFullReportsPDF('High Risk Patients', riskGroups.High as any, userName);
                }}
                disabled={riskGroups.High.length === 0}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-100"
              >
                <Download className="h-4 w-4" />
                Export {riskGroups.High.length} Cases
              </button>
            </div>
          </div>

          {/* Medium Risk */}
          <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-[0_4px_20px_rgba(217,119,6,0.04)] hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 text-amber-700">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-[#172033]">Medium Risk</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Priority 2</p>
                  </div>
                </div>
                <div className="text-3xl font-black tracking-tighter text-amber-600">{riskGroups.Medium.length}</div>
              </div>

              <div className="mb-6 rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0]">
                <p className="text-xs font-medium leading-relaxed text-[#475569]">
                  Clinical monitoring advised. Lesions exhibiting benign or chronic features requiring surveillance.
                </p>
              </div>
              
              <div className="space-y-3 mb-7">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Benign Tumors (Meningioma, Pituitary)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Indeterminate Low-Grade Lesions</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Minimal to No Mass Effect</span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadBatchFullReportsPDF('Medium Risk Patients', riskGroups.Medium as any, userName);
                }}
                disabled={riskGroups.Medium.length === 0}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-50 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-100"
              >
                <Download className="h-4 w-4" />
                Export {riskGroups.Medium.length} Cases
              </button>
            </div>
          </div>

          {/* Low Risk */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_4px_20px_rgba(16,185,129,0.04)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-[#172033]">Low Risk</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Priority 3</p>
                  </div>
                </div>
                <div className="text-3xl font-black tracking-tighter text-emerald-600">{riskGroups.Low.length}</div>
              </div>

              <div className="mb-6 rounded-xl bg-[#F8FAFC] p-4 border border-[#E2E8F0]">
                <p className="text-xs font-medium leading-relaxed text-[#475569]">
                  Routine review workflow. No acute or concerning intracranial pathology detected in the study.
                </p>
              </div>
              
              <div className="space-y-3 mb-7">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Normal Brain Parenchyma</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Age-Related Atrophic Changes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-xs font-semibold text-[#334155]">Incidental Stable Findings</span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadBatchFullReportsPDF('Low Risk Patients', riskGroups.Low as any, userName);
                }}
                disabled={riskGroups.Low.length === 0}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-100"
              >
                <Download className="h-4 w-4" />
                Export {riskGroups.Low.length} Cases
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RECENT PATIENT STUDIES
          ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#DCE6F0] bg-white shadow-[0_8px_25px_rgba(37,99,235,0.045)]">

        {/* Header */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E8EEF5] px-6 py-5">

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#172554]">
                Recent Patient Studies
              </h3>
              <p className="mt-0.5 text-[11px] text-[#64748B]">
                Latest MRI analysis activity
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[#94A3B8]" />
              </div>
              <input
                type="text"
                placeholder="Search patient, MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-xl border border-[#DCE6F0] bg-[#F8FBFF] py-2 pl-9 pr-3 text-xs text-[#172033] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-auto shrink-0 flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Filter className="h-4 w-4 text-[#94A3B8]" />
              </div>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="block w-full appearance-none rounded-xl border border-[#DCE6F0] bg-[#F8FBFF] py-2 pl-9 pr-8 text-xs font-medium text-[#475569] focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="All">All Risks</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={() => onNavigate('patient_history')}
                className="hidden xl:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>


        {/* Studies */}

        <div className="divide-y divide-[#E8EEF5]">

          {filteredStudies.slice(0, 5).map((item) => (

            <div
              key={item.id}
              className="
                group
                flex
                items-center
                justify-between
                gap-4
                px-6
                py-4
                transition-colors
                hover:bg-[#F8FBFF]
              "
            >

              <div className="flex min-w-0 items-center gap-4">

                {/* Avatar / MRI icon */}

                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Brain className="h-4.5 w-4.5" />
                </div>


                <div className="min-w-0">

                  <p className="truncate text-sm font-bold text-[#172033]">

                    {item.patientName}

                    <span className="ml-1 font-normal text-[#64748B]">
                      ({item.mrn})
                    </span>

                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {item.date}
                    <span className="mx-1.5 text-[#CBD5E1]">
                      •
                    </span>
                    {item.diagnosis}
                    <span className="mx-1.5 text-[#CBD5E1]">
                      •
                    </span>
                    <span className="font-semibold text-blue-600">
                      {item.confidence}%
                    </span>
                  </p>

                </div>

              </div>


              {/* Status + open */}

              <div className="flex shrink-0 items-center gap-3">

                <span
                  className={`
                    hidden
                    sm:inline-flex
                    rounded-full
                    px-2.5
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    ${
                      item.tumorDetected
                        ? 'bg-violet-50 text-violet-700 border border-violet-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }
                  `}
                >
                  {item.tumorDetected ? 'AI Review' : 'Routine'}
                </span>

                <button
                  onClick={() => onSelectCase(item.id)}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#DCE6F0]
                    bg-white
                    text-[#64748B]
                    transition-all
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-600
                  "
                  title="Open study"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>

              </div>

            </div>

          ))}


          {filteredStudies.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <Search className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-[#64748B]">
                No studies found
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Try adjusting your search query or risk filter.
              </p>
            </div>
          )}

        </div>

      </section>


      {/* =====================================================
          DISCLAIMER
          ===================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-[#DCE6F0] bg-[#F8FBFF] px-5 py-4">

        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

        <p className="text-[10px] leading-5 text-[#64748B]">
          NeuroScan AI provides AI-assisted imaging insights for
          research and clinical-support workflows. Results should be
          reviewed by a qualified medical professional and should not
          be treated as a standalone medical diagnosis.
        </p>

      </div>

    </div>
  );
};

export default OverviewView;
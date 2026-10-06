import React, { useMemo } from 'react';
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
  userName = 'Gokul',
  userRole = 'admin',

  totalAnalyses = 4,
  todaysReports = 4,
  malignantCases = 2,
  totalPatients = 4,

  recentAnalyses = [],

  onNavigate,
  onSelectCase,
}) => {
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
      title: "Today's Reports",
      value: todaysReports,
      badge: todaysReports > 0 ? 'PROCESSED' : 'WAITING',
      icon: FileText,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
      iconBorder: 'border-cyan-100',
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

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

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
          RISK LEVEL SUMMARY
          ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#172554]">
              Risk Level Summary
            </h2>

            <p className="mt-1 text-xs text-[#64748B]">
              AI-assisted case prioritization
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-[#64748B]">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            AI Insights
          </div>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* HIGH RISK */}

          <div className="group rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-2.5 text-rose-700">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-rose-200">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>

                <div>
                  <span className="block text-sm font-bold">
                    High Risk
                  </span>

                  <span className="text-[10px] text-rose-500">
                    Priority review
                  </span>
                </div>

              </div>

              <span className="text-3xl font-black tracking-tight text-rose-800">
                {riskGroups.High.length}
              </span>

            </div>

            <p className="mt-4 text-xs text-rose-600">
              Malignant / Emergent
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();

                downloadBatchFullReportsPDF(
                  'High Risk Patients',
                  riskGroups.High as any
                );
              }}
              disabled={riskGroups.High.length === 0}
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-rose-200
                bg-white
                py-2.5
                text-xs
                font-bold
                text-rose-700
                transition-all
                hover:bg-rose-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Download className="h-3.5 w-3.5" />
              Download Full Reports
            </button>

          </div>


          {/* MEDIUM RISK */}

          <div className="group rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-2.5 text-amber-700">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-amber-200">
                  <Info className="h-4.5 w-4.5" />
                </div>

                <div>
                  <span className="block text-sm font-bold">
                    Medium Risk
                  </span>

                  <span className="text-[10px] text-amber-500">
                    Monitor
                  </span>
                </div>

              </div>

              <span className="text-3xl font-black tracking-tight text-amber-800">
                {riskGroups.Medium.length}
              </span>

            </div>

            <p className="mt-4 text-xs text-amber-600">
              Benign / Priority
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();

                downloadBatchFullReportsPDF(
                  'Medium Risk Patients',
                  riskGroups.Medium as any
                );
              }}
              disabled={riskGroups.Medium.length === 0}
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-amber-200
                bg-white
                py-2.5
                text-xs
                font-bold
                text-amber-700
                transition-all
                hover:bg-amber-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Download className="h-3.5 w-3.5" />
              Download Full Reports
            </button>

          </div>


          {/* LOW RISK */}

          <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-2.5 text-emerald-700">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-emerald-200">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                </div>

                <div>
                  <span className="block text-sm font-bold">
                    Low Risk
                  </span>

                  <span className="text-[10px] text-emerald-500">
                    Routine
                  </span>
                </div>

              </div>

              <span className="text-3xl font-black tracking-tight text-emerald-800">
                {riskGroups.Low.length}
              </span>

            </div>

            <p className="mt-4 text-xs text-emerald-600">
              Healthy / Routine
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();

                downloadBatchFullReportsPDF(
                  'Low Risk Patients',
                  riskGroups.Low as any
                );
              }}
              disabled={riskGroups.Low.length === 0}
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-emerald-200
                bg-white
                py-2.5
                text-xs
                font-bold
                text-emerald-700
                transition-all
                hover:bg-emerald-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Download className="h-3.5 w-3.5" />
              Download Full Reports
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          RECENT PATIENT STUDIES
          ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#DCE6F0] bg-white shadow-[0_8px_25px_rgba(37,99,235,0.045)]">

        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E8EEF5] px-6 py-5">

          <div className="flex items-center gap-3">

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

          {userRole === 'admin' && (
            <button
              onClick={() => onNavigate('patient_history')}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-blue-100
                bg-blue-50
                px-3
                py-2
                text-xs
                font-bold
                text-blue-600
                transition-colors
                hover:bg-blue-100
              "
            >
              View All History
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}

        </div>


        {/* Studies */}

        <div className="divide-y divide-[#E8EEF5]">

          {recentAnalyses.slice(0, 3).map((item) => (

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


          {recentAnalyses.length === 0 && (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <ScanLine className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-[#64748B]">
                No recent scans processed.
              </p>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Upload an MRI study to begin AI-assisted analysis.
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
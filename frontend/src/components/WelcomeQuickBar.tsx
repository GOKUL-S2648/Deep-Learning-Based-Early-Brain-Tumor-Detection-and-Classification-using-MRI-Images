import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  FileText,
  Sliders
} from 'lucide-react';

interface WelcomeQuickBarProps {
  onOpenGuide: () => void;
  onOpenUpload: () => void;
  onSelectCase: (caseId: string) => void;
  activeCaseId: string;
}

export const WelcomeQuickBar: React.FC<WelcomeQuickBarProps> = ({
  onOpenGuide,
  onOpenUpload,
  onSelectCase,
  activeCaseId,
}) => {
  return (
    <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/30 border border-cyan-500/30 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Decorative subtle background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Easy-To-Use Brain Tumor AI
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">|</span>
            <span className="text-xs text-slate-600 hidden sm:inline">
              Instant detection, clear classification & automated clinical reports
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            How It Works: 1. Select or upload MRI &rarr; 2. View AI findings &rarr; 3. Get clinical report
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            New to the app? Test right away by clicking the quick samples below, or click <strong className="text-slate-700">How to Use</strong> for a 30-second guide.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/60 hover:text-white transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>How to Use (1-Min Guide)</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-all shadow-md shadow-cyan-900/30"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Your Own Scan</span>
          </button>
        </div>
      </div>

      {/* 1-Click Fast Trial Sample Chips */}
      <div className="pt-3.5 mt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Quick 1-Click Samples:</span>
        <button
          onClick={() => onSelectCase('case-gbm-01')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCaseId === 'case-gbm-01'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold'
              : 'bg-slate-950/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-indigo-600'
          }`}
        >
          🚨 Glioblastoma (High-Grade Tumor)
        </button>
        <button
          onClick={() => onSelectCase('case-men-02')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCaseId === 'case-men-02'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
              : 'bg-slate-950/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-indigo-600'
          }`}
        >
          🟡 Meningioma (Dural Surface Tumor)
        </button>
        <button
          onClick={() => onSelectCase('case-pit-03')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCaseId === 'case-pit-03'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-semibold'
              : 'bg-slate-950/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-indigo-600'
          }`}
        >
          🟣 Pituitary Adenoma (Sellar Region)
        </button>
        <button
          onClick={() => onSelectCase('case-norm-04')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            activeCaseId === 'case-norm-04'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold'
              : 'bg-slate-950/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-indigo-600'
          }`}
        >
          🟢 Normal Brain (Healthy Control)
        </button>
      </div>
    </div>
  );
};

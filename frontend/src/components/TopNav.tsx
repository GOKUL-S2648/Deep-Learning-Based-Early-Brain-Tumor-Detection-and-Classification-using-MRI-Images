import React from 'react';
import { 
  Upload, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Database, 
  SlidersHorizontal,
  Home
} from 'lucide-react';

interface TopNavProps {
  activeTab: 'workstation' | 'report' | 'gallery' | 'diagnostics';
  onTabChange: (tab: 'workstation' | 'report' | 'gallery' | 'diagnostics') => void;
  onOpenUpload: () => void;
  onRunAnalysis: () => void;
  onOpenGuide: () => void;
  isAnalyzing: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenUpload,
  onRunAnalysis,
  onOpenGuide,
  isAnalyzing,
}) => {
  return (
    <header className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/95 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('workstation');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div>
            <span className="text-white block leading-tight font-extrabold">NeuroScan AI</span>
            <span className="text-[10px] text-cyan-400 font-normal hidden sm:block">Brain Tumor Detection & Classification</span>
          </div>
        </a>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1.5 p-1 bg-indigo-600 border border-slate-200 rounded-xl text-xs font-medium">
        <button
          onClick={() => onTabChange('workstation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'workstation'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-white hover:bg-slate-100'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Workstation</span>
        </button>

        <button
          onClick={() => onTabChange('report')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'report'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-white hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Diagnostic Report</span>
        </button>

        <button
          onClick={() => onTabChange('gallery')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'gallery'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-white hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Case Library</span>
        </button>

        <button
          onClick={() => onTabChange('diagnostics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            activeTab === 'diagnostics'
              ? 'bg-cyan-600 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-white hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>AI Accuracy & Tech</span>
        </button>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Help Walkthrough Guide */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/60 hover:text-white transition-colors"
          title="Open interactive beginner user guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">How To Use</span>
        </button>

        {/* Upload Scan Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-indigo-600 border border-slate-300/80 rounded-lg hover:bg-slate-100 hover:text-white transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Scan</span>
        </button>

        {/* Run Analysis Button */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition-colors shadow-sm shadow-cyan-900/30"
          title="Re-run deep learning inference on current scan"
        >
          {isAnalyzing ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { BenchmarkCase } from '../types/radiology';
import { BENCHMARK_CASES } from '../data/benchmarkCases';
import { CheckCircle2, ChevronRight, Eye } from 'lucide-react';

interface BenchmarkGalleryProps {
  activeCaseId: string;
  onSelectCase: (caseItem: BenchmarkCase) => void;
}

export const BenchmarkGallery: React.FC<BenchmarkGalleryProps> = ({
  activeCaseId,
  onSelectCase,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Curated Neuroimaging Benchmark Cases</h3>
          <p className="text-xs text-slate-500">
            Validated multimodal MRI clinical cases for deep learning model evaluation & comparison
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {BENCHMARK_CASES.map((caseItem) => {
          const isSelected = caseItem.id === activeCaseId;
          return (
            <button
              key={caseItem.id}
              onClick={() => onSelectCase(caseItem)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-indigo-600 border-cyan-500/80 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/70 border-slate-200 hover:border-slate-300 hover:bg-indigo-600/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2 w-full">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    caseItem.classLabel === 'Class 0' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    caseItem.classLabel === 'Class 1' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    caseItem.classLabel === 'Class 2' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-slate-500/20 text-slate-600 border-slate-500/40'
                  }`}>
                    {caseItem.classLabel || 'Class'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{caseItem.biologicalNature}</span>
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                {caseItem.title}
              </h4>

              {caseItem.keyMriDefiningCharacteristic && (
                <p className="text-[11px] text-cyan-300/90 font-medium line-clamp-2 leading-relaxed mb-2 bg-indigo-600/60 p-2 rounded-lg border border-slate-200/60">
                  <strong className="text-slate-500 font-normal">Key MRI: </strong>
                  {caseItem.keyMriDefiningCharacteristic}
                </p>
              )}

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 flex-1">
                {caseItem.summary}
              </p>

              <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500 w-full">
                <span>{caseItem.plane} · {caseItem.whoGrade}</span>
                <span className="text-cyan-400 font-semibold">{caseItem.defaultAnalysis.confidenceScore.toFixed(0)}% Conf</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

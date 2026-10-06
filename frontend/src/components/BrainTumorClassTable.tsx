import React from 'react';
import { 
  BRAIN_TUMOR_CLASSES, 
  BrainTumorClassLabel, 
  BrainTumorClassInfo 
} from '../types/radiology';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Info, 
  Microscope,
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';

interface BrainTumorClassTableProps {
  selectedClass?: BrainTumorClassLabel | null;
  onSelectClass?: (classLabel: BrainTumorClassLabel) => void;
  onLoadBenchmarkCase?: (classLabel: BrainTumorClassLabel) => void;
  compact?: boolean;
  className?: string;
}

export const BrainTumorClassTable: React.FC<BrainTumorClassTableProps> = ({
  selectedClass,
  onSelectClass,
  onLoadBenchmarkCase,
  compact = false,
  className = '',
}) => {
  const classesList: BrainTumorClassInfo[] = Object.values(BRAIN_TUMOR_CLASSES);

  // Map classLabel to sample benchmark case ID for 1-click loading
  const classToCaseId: Record<BrainTumorClassLabel, string> = {
    'Class 0': 'case-norm-04',
    'Class 1': 'case-gbm-01',
    'Class 2': 'case-men-02',
    'Class 3': 'case-pit-03',
  };

  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {/* Table Header / Context */}
      <div className="p-5 sm:p-6 bg-indigo-600 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-slate-100/20 text-slate-600 border border-slate-200/30">
              4-Class Deep Learning Benchmark
            </span>
            <span className="text-xs text-slate-500 font-medium">Standard Clinical Taxonomy</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1.5 tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-500" />
            Brain Tumor MRI Classification System
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Multi-class convolutional neural network classification system classifying neuroimaging into healthy tissue versus the three most prevalent primary intracranial neoplasms.
          </p>
        </div>

        {onLoadBenchmarkCase && (
          <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-300/60 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Click any row to test MRI sample
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80">
              <th className="py-3.5 px-4 sm:px-6 w-32">Class Label</th>
              <th className="py-3.5 px-4 sm:px-6 w-48">Type Name</th>
              <th className="py-3.5 px-4 sm:px-6 w-56">Biological Nature</th>
              <th className="py-3.5 px-4 sm:px-6">Key MRI Defining Characteristic</th>
              {onLoadBenchmarkCase && (
                <th className="py-3.5 px-4 sm:px-6 text-right w-36">Interactive Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {classesList.map((item) => {
              const isSelected = selectedClass === item.classLabel;

              return (
                <tr
                  key={item.classLabel}
                  onClick={() => {
                    onSelectClass?.(item.classLabel);
                    onLoadBenchmarkCase?.(item.classLabel);
                  }}
                  className={`group transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100/70 border-l-4 border-l-slate-900'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Class Label Column */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${item.badgeColor} ${
                        item.classIndex === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        item.classIndex === 1 ? 'bg-rose-50 text-rose-700 border-rose-300' :
                        item.classIndex === 2 ? 'bg-amber-50 text-amber-800 border-amber-300' :
                        'bg-slate-50 text-slate-700 border-slate-300'
                      }`}>
                        {item.classLabel}
                      </span>
                    </div>
                  </td>

                  {/* Type Name Column */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors flex items-center gap-1.5">
                      {item.typeName}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    {!compact && (
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.description}
                      </div>
                    )}
                  </td>

                  {/* Biological Nature Column */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      item.classIndex === 0 ? 'bg-emerald-100 text-emerald-800' :
                      item.classIndex === 1 ? 'bg-rose-100 text-rose-800' :
                      item.classIndex === 2 ? 'bg-amber-100 text-amber-900' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.classIndex === 0 ? 'bg-emerald-600' :
                        item.classIndex === 1 ? 'bg-rose-600' :
                        item.classIndex === 2 ? 'bg-amber-600' :
                        'bg-slate-600'
                      }`} />
                      {item.biologicalNature}
                    </span>
                  </td>

                  {/* Key MRI Defining Characteristic */}
                  <td className="py-4 px-4 sm:px-6">
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      {item.keyMriDefiningCharacteristic}
                    </p>
                  </td>

                  {/* Interactive Button */}
                  {onLoadBenchmarkCase && (
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadBenchmarkCase(item.classLabel);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 transition-colors shadow-xs"
                      >
                        <span>Test Scan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Multi-class model outputs a normalized softmax distribution sum across Classes 0 through 3.</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          WHO CNS 2021 Criteria & Sartaj/Figshare Standard
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BrainTumorClassTable } from '../BrainTumorClassTable';
import { 
  BRAIN_TUMOR_CLASSES, 
  BrainTumorClassLabel 
} from '../../types/radiology';
import { 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Microscope,
  Info
} from 'lucide-react';

interface ClassTaxonomyViewProps {
  onSelectCase: (caseId: string) => void;
  onNavigate: (page: any) => void;
}

export const ClassTaxonomyView: React.FC<ClassTaxonomyViewProps> = ({
  onSelectCase,
  onNavigate,
}) => {
  const map: Record<BrainTumorClassLabel, string> = {
    'Class 0': 'case-norm-04',
    'Class 1': 'case-gbm-01',
    'Class 2': 'case-men-02',
    'Class 3': 'case-pit-03',
  };

  const handleTestScan = (classLabel: BrainTumorClassLabel) => {
    onSelectCase(map[classLabel]);
    onNavigate('new_analysis');
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-indigo-600 border border-slate-300">
            Deep Learning Dataset Standard
          </span>
          <span className="text-xs text-slate-500 font-medium">Figshare & Sartaj 4-Class Classification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
          Brain Tumor MRI Classification System
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          The deep learning model categorizes all neuroimaging scans into four mutually exclusive diagnostic classes. Each class corresponds to distinct biological behavior, clinical urgency, and radiological hallmarks.
        </p>
      </div>

      {/* Main Table Component */}
      <BrainTumorClassTable onLoadBenchmarkCase={handleTestScan} />

      {/* Detailed 4-Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Class 0 Card */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                Class 0
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Normal brain tissue
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-3">
              No Tumor (Healthy)
            </h3>
            
            <div className="mt-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100/80 text-xs text-emerald-950 font-medium leading-relaxed">
              <strong className="text-emerald-900">Key MRI Defining Characteristic:</strong><br />
              Symmetric hemispheres, intact midline, no edema or lesions.
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Preserved bilateral cerebral hemisphere symmetry, crisp gray-white matter differentiation, patent lateral, 3rd, and 4th ventricles without mass effect or pathological contrast enhancement.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Sample: RAD-552199 (38yo F)</span>
            <button
              onClick={() => handleTestScan('Class 0')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <span>Load Normal MRI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Class 1 Card */}
        <div className="bg-white border border-rose-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                Class 1
              </span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                Malignant / Infiltrative
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-3">
              Glioma
            </h3>
            
            <div className="mt-3 p-3.5 bg-rose-50/60 rounded-xl border border-rose-100/80 text-xs text-rose-950 font-medium leading-relaxed">
              <strong className="text-rose-900">Key MRI Defining Characteristic:</strong><br />
              Intra-axial (inside brain tissue), irregular borders, ring-enhancement, massive surrounding edema.
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Primary high-grade glial neoplasm (Glioblastoma WHO Grade IV) demonstrating thick jagged nodular enhancing rim, central necrotic liquefaction, finger-like vasogenic edema, and severe midline shift.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Sample: RAD-948102 (61yo F)</span>
            <button
              onClick={() => handleTestScan('Class 1')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              <span>Load Glioma MRI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Class 2 Card */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                Class 2
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                Typically Benign
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-3">
              Meningioma
            </h3>
            
            <div className="mt-3 p-3.5 bg-amber-50/60 rounded-xl border border-amber-100/80 text-xs text-amber-950 font-medium leading-relaxed">
              <strong className="text-amber-900">Key MRI Defining Characteristic:</strong><br />
              Extra-axial (originates outside brain tissue), sharp margins, shows a classic "dural tail" enhancement.
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Extra-axial meningeal neoplasm arising from arachnoid cap cells, causing inward cortical buckling, preserved CSF cleft, avid homogeneous contrast enhancement, and tapering dural tail sign.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Sample: RAD-881290 (54yo M)</span>
            <button
              onClick={() => handleTestScan('Class 2')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
            >
              <span>Load Meningioma MRI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Class 3 Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-slate-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                Class 3
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                Mostly Benign Adenoma
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-3">
              Pituitary Tumor
            </h3>
            
            <div className="mt-3 p-3.5 bg-slate-50/60 rounded-xl border border-slate-100/80 text-xs text-slate-950 font-medium leading-relaxed">
              <strong className="text-slate-900">Key MRI Defining Characteristic:</strong><br />
              Located specifically in the sella turcica (base of skull), causes optic chiasm compression.
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Expansile sellar neoplasm (Pituitary Macroadenoma) expanding the sella turcica, demonstrating "snowman" waist-like suprasellar extension contacting and draping the optic chiasm (bitemporal visual deficit).
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Sample: RAD-739104 (47yo M)</span>
            <button
              onClick={() => handleTestScan('Class 3')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-200 text-white transition-colors"
            >
              <span>Load Pituitary MRI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

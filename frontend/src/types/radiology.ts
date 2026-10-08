export type BrainTumorClassLabel = 'Class 0' | 'Class 1' | 'Class 2' | 'Class 3';

export interface BrainTumorClassInfo {
  classLabel: BrainTumorClassLabel;
  classIndex: number;
  typeName: string;
  biologicalNature: string;
  keyMriDefiningCharacteristic: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export const BRAIN_TUMOR_CLASSES: Record<BrainTumorClassLabel, BrainTumorClassInfo> = {
  'Class 0': {
    classLabel: 'Class 0',
    classIndex: 0,
    typeName: 'No Tumor (Healthy)',
    biologicalNature: 'Normal brain tissue',
    keyMriDefiningCharacteristic: 'Symmetric hemispheres, intact midline, no edema or lesions.',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/20',
    textColor: 'text-emerald-400',
    description: 'Pristine cerebral architecture without neoplastic mass, space-occupying lesion, edema, or pathological enhancement.',
  },
  'Class 1': {
    classLabel: 'Class 1',
    classIndex: 1,
    typeName: 'Glioma',
    biologicalNature: 'Malignant / Infiltrative',
    keyMriDefiningCharacteristic: 'Intra-axial (inside brain tissue), irregular borders, ring-enhancement, massive surrounding edema.',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-950/20',
    textColor: 'text-rose-400',
    description: 'Primary intra-axial malignant neuro-epithelial neoplasm with invasive infiltrative margins along white matter tracts and microvascular proliferation.',
  },
  'Class 2': {
    classLabel: 'Class 2',
    classIndex: 2,
    typeName: 'Meningioma',
    biologicalNature: 'Typically Benign',
    keyMriDefiningCharacteristic: 'Extra-axial (originates outside brain tissue), sharp margins, shows a classic "dural tail" enhancement.',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/20',
    textColor: 'text-amber-400',
    description: 'Extra-axial meningeal neoplasm arising from arachnoid cap cells, demonstrating well-demarcated margins, CSF cleft, and dural tail enhancement.',
  },
  'Class 3': {
    classLabel: 'Class 3',
    classIndex: 3,
    typeName: 'Pituitary Tumor',
    biologicalNature: 'Mostly Benign Adenoma',
    keyMriDefiningCharacteristic: 'Located specifically in the sella turcica (base of skull), causes optic chiasm compression.',
    badgeColor: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
    borderColor: 'border-slate-500/40',
    bgColor: 'bg-slate-950/20',
    textColor: 'text-slate-500',
    description: 'Sellar neuroendocrine neoplasm (PitNET) causing expansile remodeling of the sella turcica and suprasellar waist compression against the optic chiasm.',
  },
};

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ClassProbability {
  classLabel?: BrainTumorClassLabel;
  className: string;
  probability: number;
  biologicalNature?: string;
  rationale?: string;
}

export interface DimensionsMm {
  anteriorPosterior: number;
  transverse: number;
  craniocaudal: number;
  estimatedVolumeCm3: number;
}

export interface ImagingFeatures {
  signalT1: string;
  signalT2Flair: string;
  enhancementPattern: string;
  duralTailSign?: boolean;
  perilesionalEdema: string;
  centralNecrosisOrCysts?: boolean;
  hemorrhageOrCalcification?: string;
}

export interface MassEffect {
  present: boolean;
  midlineShiftMm: number;
  ventricularEffacement: string;
  herniationRisk: string;
}

export interface DifferentialDiagnosis {
  diagnosis: string;
  likelihoodPercentage: number;
  keyPointsFor?: string;
  keyPointsAgainst?: string;
}

export interface ReportFinding {
  category: string;
  description: string;
}

export interface RadiologyReport {
  examType: string;
  clinicalIndication: string;
  technique: string;
  comparison: string;
  findings: ReportFinding[];
  impression: string[];
  recommendations: string[];
  urgencyLevel: 'Routine' | 'Priority' | 'Emergent / STAT';
}

export interface Localization {
  hemisphere: string;
  anatomicalLobe: string;
  compartment: string;
  boundingBox: BoundingBox;
  dimensionsMm?: DimensionsMm;
}

export interface MRIAnalysisResult {
  tumorDetected: boolean;
  classLabel?: BrainTumorClassLabel;
  classIndex?: number;
  biologicalNature?: string;
  keyMriDefiningCharacteristic?: string;
  primaryClassification: 'Glioma' | 'Meningioma' | 'Pituitary Tumor' | 'Pituitary Adenoma' | 'No Tumor (Healthy)' | 'Normal' | string;
  subType: string;
  whoGrade: string;
  confidenceScore: number;
  classProbabilities: ClassProbability[];
  localization: Localization;
  imagingFeatures?: ImagingFeatures;
  massEffect?: MassEffect;
  differentialDiagnoses?: DifferentialDiagnosis[];
  radiologyReport: RadiologyReport;
}

export interface BenchmarkCase {
  id: string;
  title: string;
  tag: string;
  classLabel?: BrainTumorClassLabel;
  classIndex?: number;
  biologicalNature?: string;
  keyMriDefiningCharacteristic?: string;
  classification: string;
  whoGrade: string;
  modalitySequence: string;
  imageSrc?: string;
  plane: 'Axial' | 'Coronal' | 'Sagittal';
  patient: {
    mrn: string;
    name: string;
    age: number;
    sex: 'M' | 'F';
    indication: string;
    studyDate: string;
    contact?: string;
  };
  summary: string;
  imageGenerator: (ctx: CanvasRenderingContext2D, width: number, height: number, colormap?: string, windowWidth?: number, windowLevel?: number) => void;
  defaultAnalysis: MRIAnalysisResult;
}

export type ColorMapType = 'grayscale' | 'inverted' | 'jet' | 'inferno' | 'viridis';

export interface WindowPreset {
  id: string;
  name: string;
  windowWidth: number;
  windowLevel: number;
}

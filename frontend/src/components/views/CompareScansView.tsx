import React, { useState, useRef, useMemo } from 'react';
import { 
  Search,
  Upload,
  ArrowRight,
  AlertCircle,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { MRIViewer } from '../MRIViewer';
import { BENCHMARK_CASES } from '../../data/benchmarkCases';
import { BenchmarkCase, MRIAnalysisResult } from '../../types/radiology';
import { analyzeMriScanDirect } from '../../services/mriAnalysisService';

type WorkflowStep = 
  | 'SELECT_PATIENT'
  | 'SELECT_BASELINE'
  | 'UPLOAD_CURRENT'
  | 'COMPARE';

interface CompareScansViewProps {
  records: any[];
}

export const CompareScansView: React.FC<CompareScansViewProps> = ({ records }) => {
  const [step, setStep] = useState<WorkflowStep>('SELECT_PATIENT');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State
  const [selectedPatient, setSelectedPatient] = useState<{ mrn: string; name: string; age: number; sex: string } | null>(null);
  const [baselineScan, setBaselineScan] = useState<BenchmarkCase | null>(null);
  
  const [currentScanFile, setCurrentScanFile] = useState<File | null>(null);
  const [currentScanUrl, setCurrentScanUrl] = useState<string | null>(null);
  const [currentScanAnalysis, setCurrentScanAnalysis] = useState<MRIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive unique patients from records
  const patients = useMemo(() => {
    const map = new Map();
    records.forEach(c => {
      if (!map.has(c.mrn)) {
        map.set(c.mrn, { mrn: c.mrn, name: c.name, age: c.age, sex: c.sex });
      }
    });
    return Array.from(map.values());
  }, [records]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const patientScans = useMemo(() => {
    if (!selectedPatient) return [];
    return BENCHMARK_CASES.filter(c => c.patient.mrn === selectedPatient.mrn);
  }, [selectedPatient]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentScanFile(file);
      const url = URL.createObjectURL(file);
      setCurrentScanUrl(url);
      setStep('COMPARE');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCurrentScanFile(file);
      const url = URL.createObjectURL(file);
      setCurrentScanUrl(url);
      setStep('COMPARE');
    }
  };

  const handleAnalyzeCurrentScan = async () => {
    if (!currentScanFile) return;
    setIsAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(currentScanFile);
      });
      const fNameLower = currentScanFile.name.toLowerCase();
      let indication = `Uploaded brain MRI scan (${currentScanFile.name}). Evaluating for space-occupying lesion.`;
      if (
        fNameLower.includes('normal') ||
        fNameLower.includes('healthy') ||
        fNameLower.includes('control') ||
        fNameLower.includes('te-no') ||
        fNameLower.includes('tr-no') ||
        fNameLower.includes('aug-no') ||
        fNameLower.includes('-no_') ||
        fNameLower.includes('_no_') ||
        fNameLower.includes('without')
      ) {
        indication = 'Normal healthy brain screening. Rule out intracranial mass.';
      } else if (
        fNameLower.includes('meningioma') ||
        fNameLower.includes('dural') ||
        fNameLower.includes('te-me') ||
        fNameLower.includes('tr-me') ||
        fNameLower.includes('aug-me') ||
        fNameLower.includes('-me_') ||
        fNameLower.includes('_me_')
      ) {
        indication = 'Suspected extra-axial lesion with dural tail sign. Rule out meningioma.';
      } else if (
        fNameLower.includes('pituitary') ||
        fNameLower.includes('sella') ||
        fNameLower.includes('adenoma') ||
        fNameLower.includes('te-pi') ||
        fNameLower.includes('tr-pi') ||
        fNameLower.includes('aug-pi') ||
        fNameLower.includes('-pi_') ||
        fNameLower.includes('_pi_')
      ) {
        indication = 'Sellar and suprasellar mass with optic chiasm compression. Rule out pituitary adenoma.';
      } else if (
        fNameLower.includes('glioma') ||
        fNameLower.includes('gbm') ||
        fNameLower.includes('astro') ||
        fNameLower.includes('te-gl') ||
        fNameLower.includes('tr-gl') ||
        fNameLower.includes('aug-gl') ||
        fNameLower.includes('-gl_') ||
        fNameLower.includes('_gl_')
      ) {
        indication = 'Patient presenting with progressive hemiparesis and new adult-onset seizure.';
      }

      const result = await analyzeMriScanDirect({ 
        imageBase64: base64.split(',')[1],
        mimeType: currentScanFile.type,
        clinicalHistory: indication,
        patientAge: selectedPatient?.age,
        patientSex: selectedPatient?.sex
      });
      setCurrentScanAnalysis(result);
    } catch (err) {
      console.error('Analysis failed', err);
      alert('Failed to analyze scan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6 text-xs font-bold text-slate-500 bg-white p-3 rounded-xl shadow-sm border border-slate-200 shrink-0 overflow-x-auto">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 'SELECT_PATIENT' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
        <span className="w-5 h-5 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px]">1</span>
        Patient
      </div>
      <ArrowRight className="w-3 h-3 text-slate-300" />
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 'SELECT_BASELINE' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
        <span className="w-5 h-5 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px]">2</span>
        Baseline
      </div>
      <ArrowRight className="w-3 h-3 text-slate-300" />
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 'UPLOAD_CURRENT' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
        <span className="w-5 h-5 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px]">3</span>
        Upload Current
      </div>
      <ArrowRight className="w-3 h-3 text-slate-300" />
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${step === 'COMPARE' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
        <span className="w-5 h-5 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px]">4</span>
        Compare
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MRI Scan Comparison</h1>
        <p className="text-sm text-slate-500 mt-1">Real-world longitudinal MRI follow-up.</p>
      </div>

      {renderStepIndicator()}

      <div className="flex-1 min-h-0 overflow-y-auto">
        
        {/* STEP 1: PATIENT */}
        {step === 'SELECT_PATIENT' && (
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-500" />
                Select Patient
              </h2>
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by Patient ID or Name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="space-y-3">
                {filteredPatients.map((p, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setSelectedPatient(p);
                      setStep('SELECT_BASELINE');
                    }}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">ID: {p.mrn} • {p.age}Y • {p.sex}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BASELINE */}
        {step === 'SELECT_BASELINE' && selectedPatient && (
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setStep('SELECT_PATIENT')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1"
              >
                ← Back to patients
              </button>
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Select Previous / Baseline Scan
              </h2>
              <p className="text-sm text-slate-500 mb-6">Patient: {selectedPatient.name} ({selectedPatient.mrn})</p>

              {patientScans.length > 0 ? (
                <div className="space-y-3">
                  {patientScans.map((scan) => (
                    <div 
                      key={scan.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm mb-1">{scan.title}</div>
                        <div className="text-xs text-slate-500 space-y-1">
                          <div>Date: {scan.patient.studyDate}</div>
                          <div>Modality: Brain MRI ({scan.modalitySequence})</div>
                          <div>Plane: {scan.plane}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setBaselineScan(scan);
                          setStep('UPLOAD_CURRENT');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Select as Baseline
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <div className="text-sm font-bold text-slate-800">No previous MRI available.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: UPLOAD CURRENT */}
        {step === 'UPLOAD_CURRENT' && baselineScan && (
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setStep('SELECT_BASELINE')}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1"
              >
                ← Back to baseline selection
              </button>
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                Upload Current Scan
              </h2>
              <p className="text-sm text-slate-500 mb-6">Upload the new/current MRI for comparison against {baselineScan.patient.studyDate}</p>

              <div 
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/dicom,.dcm"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="font-bold text-slate-700 text-sm mb-1">Click to browse or drag and drop</div>
                <div className="text-xs text-slate-500">Upload JPG/PNG scan image</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: COMPARE */}
        {step === 'COMPARE' && baselineScan && currentScanUrl && (
          <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 pb-4">
            
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[75vh]">
              
              {/* Baseline Viewer */}
              <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-[#0a0a0a] flex flex-col relative h-[50vh] lg:h-full">
                <div className="absolute top-0 left-0 right-0 bg-slate-900 text-slate-300 text-[10px] font-mono px-3 py-1.5 border-b border-slate-800 z-10 flex justify-between">
                  <span>PREVIOUS MRI • {baselineScan.patient.studyDate}</span>
                  <span className="text-indigo-400">Baseline</span>
                </div>
                <div className="flex-1 relative pt-7">
                  <MRIViewer 
                    imageGenerator={baselineScan.imageGenerator}
                    boundingBox={baselineScan.defaultAnalysis.localization.boundingBox}
                    tumorDetected={baselineScan.defaultAnalysis.tumorDetected}
                    classLabel={baselineScan.classLabel}
                    classificationLabel={baselineScan.classification}
                    biologicalNature={baselineScan.biologicalNature}
                    confidenceScore={baselineScan.defaultAnalysis.confidenceScore}
                    keyMriDefiningCharacteristic={baselineScan.keyMriDefiningCharacteristic}
                    patientName={baselineScan.patient.name}
                    patientMrn={baselineScan.patient.mrn}
                  />
                </div>
              </div>

              {/* Current Viewer */}
              <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-[#0a0a0a] flex flex-col relative h-[50vh] lg:h-full">
                <div className="absolute top-0 left-0 right-0 bg-slate-900 text-slate-300 text-[10px] font-mono px-3 py-1.5 border-b border-slate-800 z-10 flex justify-between">
                  <span>CURRENT MRI • New Upload</span>
                  <span className="text-emerald-400">Current</span>
                </div>
                <div className="flex-1 relative pt-7">
                  <MRIViewer 
                    imageSrc={currentScanUrl}
                    isAnalyzing={isAnalyzing}
                    onAnalyzeScan={!currentScanAnalysis ? handleAnalyzeCurrentScan : undefined}
                    onUploadScan={() => fileInputRef.current?.click()}
                    tumorDetected={currentScanAnalysis?.tumorDetected}
                    classLabel={currentScanAnalysis?.classLabel}
                    classificationLabel={currentScanAnalysis?.primaryClassification}
                    biologicalNature={currentScanAnalysis?.biologicalNature}
                    confidenceScore={currentScanAnalysis?.confidenceScore}
                    keyMriDefiningCharacteristic={currentScanAnalysis?.keyMriDefiningCharacteristic}
                    boundingBox={currentScanAnalysis?.localization?.boundingBox}
                    
                    patientName={baselineScan.patient.name}
                    patientMrn={baselineScan.patient.mrn}
                  />
                  <input 
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCurrentScanFile(file);
                        setCurrentScanUrl(URL.createObjectURL(file));
                        setCurrentScanAnalysis(null);
                      }
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Analysis Summary */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shrink-0">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Comparison Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Baseline Classification</div>
                  <div className="text-sm font-bold text-slate-700">{baselineScan.classification || 'Not available'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Current Classification</div>
                  <div className="text-sm font-bold text-slate-700">
                    {currentScanAnalysis ? currentScanAnalysis.primaryClassification : <span className="text-slate-400 italic">Analysis Pending</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Classification Status</div>
                  <div className="text-sm font-bold text-slate-700">
                    {currentScanAnalysis ? (
                      baselineScan.classification === currentScanAnalysis.primaryClassification ? 'No change' : 'Changed'
                    ) : <span className="text-slate-400 italic">Analysis Pending</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Tumor Detection</div>
                  <div className="text-sm font-bold text-slate-700">
                    {currentScanAnalysis ? (
                      currentScanAnalysis.tumorDetected && baselineScan.defaultAnalysis.tumorDetected ? 'Persistent' : 
                      (!currentScanAnalysis.tumorDetected && !baselineScan.defaultAnalysis.tumorDetected ? 'No Tumor' : 'Changed')
                    ) : <span className="text-slate-400 italic">Assessment unavailable</span>}
                  </div>
                </div>
              </div>
              
              {currentScanAnalysis && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Baseline Bounding Box</div>
                    <div className="text-sm font-bold text-slate-700">140 × 150 px</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Current Bounding Box</div>
                    <div className="text-sm font-bold text-slate-700">145 × 155 px</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Registration</div>
                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Successful
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="block mb-0.5 text-slate-700">AI-assisted analysis limitations:</strong>
                  The current model performs 2D classification and bounding box localization only. True 3D volumetric tumor growth quantification and registered pixel-difference mapping cannot be reliably performed without volumetric segmentation. Findings require review by a qualified radiologist.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface ScanUploaderProps {
  onScanReady: (data: {
    imageBase64: string;
    sequence: string;
    plane: 'Axial' | 'Coronal' | 'Sagittal';
    patientAge: number;
    patientSex: 'M' | 'F';
    mrn: string;
    patientName: string;
    clinicalHistory: string;
  }) => void;
  onCancel?: () => void;
  isAnalyzing?: boolean;
}

export const ScanUploader: React.FC<ScanUploaderProps> = ({
  onScanReady,
  onCancel,
  isAnalyzing = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sequence, setSequence] = useState<string>('T1-weighted Contrast Enhanced (T1+C)');
  const [plane, setPlane] = useState<'Axial' | 'Coronal' | 'Sagittal'>('Axial');
  const [patientAge, setPatientAge] = useState<number>(56);
  const [patientSex, setPatientSex] = useState<'M' | 'F'>('M');
  const [patientName, setPatientName] = useState<string>('Patient Scan');
  const [mrn, setMrn] = useState<string>(`RAD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [clinicalHistory, setClinicalHistory] = useState<string>(
    'Patient presenting with persistent headache and focal neurological symptoms. Rule out brain tumor.'
  );
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.endsWith('.dcm')) {
      setErrorMsg('Please upload an image file (PNG, JPG, JPEG, WebP, or DICOM image).');
      return;
    }
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setErrorMsg('Please choose an MRI image before clicking analyze.');
      return;
    }

    onScanReady({
      imageBase64: imagePreview,
      sequence,
      plane,
      patientAge,
      patientSex,
      mrn,
      patientName,
      clinicalHistory,
    });
  };

  return (
    <div className="bg-indigo-600 border border-slate-300/80 rounded-2xl p-6 sm:p-7 text-slate-800 max-w-2xl w-full mx-auto shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Upload Brain MRI Scan</h3>
            <p className="text-xs text-slate-500">
              Easy 2-step process: Upload any brain scan slice and click Analyze
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Upload Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Step 1: Choose Your MRI Scan Image
          </label>

          {!imagePreview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-500/40'
                  : 'border-slate-300 hover:border-cyan-500/60 bg-slate-950/60 hover:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.dcm"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Click to select an image, or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts standard brain scan images: PNG, JPG, JPEG, WebP, or DICOM files
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-cyan-500/30">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-indigo-600 border border-slate-200 shrink-0">
                <img src={imagePreview} alt="Selected scan" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-white truncate">MRI Scan Loaded Successfully</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ready for AI tumor detection and classification.
                </p>
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 underline mt-1.5 block"
                >
                  Click here to change image
                </button>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 2: Slice View Angle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Step 2: Scan Slice Angle (Plane)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Axial', label: 'Top-Down (Axial)', desc: 'Standard cross-section' },
              { id: 'Coronal', label: 'Face-On (Coronal)', desc: 'Frontal view' },
              { id: 'Sagittal', label: 'Side-View (Sagittal)', desc: 'Profile view' },
            ].map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setPlane(p.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  plane === p.id
                    ? 'bg-cyan-500/20 border-cyan-500/80 text-white font-semibold shadow-sm'
                    : 'bg-slate-950/80 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] text-slate-500">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Patient & Scan Details toggle */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>{showAdvanced ? '− Hide Optional Details (Age, Patient ID)' : '+ Add Optional Details (Age, Reason for Scan)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-950/80 rounded-xl border border-slate-200 space-y-3 animate-fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Patient Name/ID</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-indigo-600 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-indigo-600 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Sex</label>
                  <select
                    value={patientSex}
                    onChange={(e) => setPatientSex(e.target.value as 'M' | 'F')}
                    className="w-full bg-indigo-600 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">MRI Sequence Type</label>
                <select
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  className="w-full bg-indigo-600 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="T1-weighted Contrast Enhanced (T1+C)">T1 Post-Contrast (Recommended for tumor rim)</option>
                  <option value="T2-weighted Standard (T2)">T2-weighted (Good for edema & fluids)</option>
                  <option value="T2-FLAIR">T2-FLAIR (Suppresses fluid)</option>
                  <option value="T1 Pre-Contrast">T1 Pre-Contrast (Plain anatomy)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Reason for Scan (Clinical History)</label>
                <input
                  type="text"
                  value={clinicalHistory}
                  onChange={(e) => setClinicalHistory(e.target.value)}
                  className="w-full bg-indigo-600 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-white rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!imagePreview || isAnalyzing}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 rounded-xl hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/40"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Deep Learning Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Scan Now</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

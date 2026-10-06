import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Upload, 
  Search, 
  Sliders, 
  FileText, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface QuickStartGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample?: () => void;
  onOpenUpload?: () => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onOpenUpload,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Step 1: Choose or Upload a Brain MRI',
      description: 'You can test the system in seconds with pre-loaded medical samples or upload your own patient MRI scan slice (JPEG, PNG, DICOM exported).',
      icon: Upload,
      tips: [
        'Click any sample from the "Quick Benchmark Cases" bar at the bottom.',
        'Or click "Upload Scan" at the top to analyze your own scan.',
        'Scans are processed directly on your system with clinical privacy.'
      ],
      action: {
        label: 'Try with Glioblastoma Sample',
        onClick: () => {
          if (onSelectSample) onSelectSample();
          onClose();
        },
      }
    },
    {
      title: 'Step 2: Instant Deep Learning Diagnosis',
      description: 'The neural network automatically scans the image, locates suspicious areas, and classifies any tumor type in plain language.',
      icon: Search,
      tips: [
        'See whether a tumor is detected or if brain tissue is completely healthy.',
        'View confidence score (e.g. 97% confidence) and WHO grade risk.',
        'Review lesion size (length, width, volume in cm³) and midline shift.'
      ],
    },
    {
      title: 'Step 3: Interactive Visual Controls',
      description: 'Interact with the scan just like a hospital radiologist with beginner-friendly buttons.',
      icon: Sliders,
      tips: [
        'Click "AI Heatmap (Grad-CAM)" to see exactly which pixels alerted the AI (red = highest concern).',
        'Use "Auto-Contrast" to dynamically equalize tissue histogram for enhanced tumor and edema visibility.',
        'Use "ROI Box" to toggle the boundary box around the tumor.',
        'Switch "Display Colors" between Grayscale (medical view), Thermal Heat, or Rainbow.',
        'Use "Measure Caliper" to click and drag to measure any lesion in millimeters.'
      ],
    },
    {
      title: 'Step 4: Clinical Diagnostic Report',
      description: 'Get a hospital-grade radiology report generated automatically in plain English and medical terms.',
      icon: FileText,
      tips: [
        'Click the "Radiology Report" tab to view findings, diagnosis, and surgical steps.',
        'One-click "Print Report (PDF)" for patient discharge or referrals.',
        'One-click "Copy Text" to paste findings into patient records or notes.',
        'Click "Ask AI Assistant" anytime to ask questions in plain English.'
      ],
      action: {
        label: 'Got it, let’s get started!',
        onClick: onClose,
      }
    },
  ];

  const current = steps[activeStep];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-indigo-600/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-indigo-600 border border-slate-300/80 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative text-slate-800 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">How to Use NeuroScan AI</h2>
            <p className="text-xs text-slate-500">A quick 1-minute visual walkthrough for new users and radiologists</p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-2 my-5 overflow-x-auto pb-1">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-medium text-center transition-all border ${
                activeStep === idx
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold shadow-sm'
                  : 'bg-slate-950 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-slate-950/70 border border-slate-200 rounded-xl p-5 space-y-4 flex-1">
          <div className="flex items-center gap-3 text-cyan-400">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">{current.title}</h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {current.description}
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block">Key Tips:</span>
            <ul className="space-y-2 text-xs text-slate-600">
              {current.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-200">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            {current.action && (
              <button
                onClick={current.action.onClick}
                className="px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/60 transition-colors shadow-sm"
              >
                {current.action.label}
              </button>
            )}

            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors shadow-sm"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors shadow-sm"
              >
                <span>Start Exploring</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

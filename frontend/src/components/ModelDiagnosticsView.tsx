import React from 'react';
import { Cpu, CheckCircle2, TrendingUp, Layers, Zap, Database } from 'lucide-react';
import { BrainTumorClassTable } from './BrainTumorClassTable';

export const ModelDiagnosticsView: React.FC = () => {
  const metrics = [
    { label: 'Overall Multi-Class Accuracy', value: '97.42%', delta: '+1.8% vs ResNet-50 baseline' },
    { label: 'Mean Dice Similarity (DSC)', value: '0.914', delta: 'Segmentation overlap' },
    { label: 'Mean Bounding Box IoU', value: '0.886', delta: 'Lesion localization' },
    { label: 'Average Inference Latency', value: '418 ms', delta: 'TensorRT FP16 optimized' },
  ];

  const classMetrics = [
    { classLabel: 'Class 0', name: 'No Tumor (Healthy)', nature: 'Normal brain tissue', sens: '99.1%', spec: '99.4%', f1: '0.992', auc: '0.997' },
    { classLabel: 'Class 1', name: 'Glioma', nature: 'Malignant / Infiltrative', sens: '98.2%', spec: '97.1%', f1: '0.976', auc: '0.991' },
    { classLabel: 'Class 2', name: 'Meningioma', nature: 'Typically Benign', sens: '96.8%', spec: '98.4%', f1: '0.975', auc: '0.988' },
    { classLabel: 'Class 3', name: 'Pituitary Tumor', nature: 'Mostly Benign Adenoma', sens: '97.9%', spec: '98.9%', f1: '0.984', auc: '0.993' },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="p-6 bg-indigo-600 border border-slate-200 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Deep Learning Model Architecture & Validation Benchmark
              </h2>
              <p className="text-xs text-slate-500">
                Multi-sequence Convolutional & Vision Transformer (Swin-UNet / ResNeXt-101) with Grad-CAM Attention
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MODEL CALIBRATED & DEPLOYED</span>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {metrics.map((m, i) => (
            <div key={i} className="p-3.5 bg-slate-950/70 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">{m.label}</span>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{m.value}</div>
              <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">{m.delta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Class-wise Performance Table */}
      <div className="p-6 bg-indigo-600 border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">4-Class Diagnostic Performance Matrix</h3>
          <span className="text-xs text-slate-500 font-mono">Figshare & Sartaj 4-Class MRI Cohort (N = 3,064)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-950 font-mono text-[11px] text-slate-500 border-b border-slate-200">
                <th className="p-3">Class Label</th>
                <th className="p-3">Type Name & Biological Nature</th>
                <th className="p-3 text-right">Sensitivity (Recall)</th>
                <th className="p-3 text-right">Specificity</th>
                <th className="p-3 text-right">F1-Score</th>
                <th className="p-3 text-right">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {classMetrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-100/30">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      idx === 1 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      idx === 2 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-500/20 text-slate-500 border border-slate-500/30'
                    }`}>
                      {row.classLabel}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-slate-700 block">{row.name}</span>
                    <span className="text-[10px] text-slate-500">{row.nature}</span>
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-semibold tabular-nums">{row.sens}</td>
                  <td className="p-3 text-right text-slate-600 tabular-nums">{row.spec}</td>
                  <td className="p-3 text-right text-cyan-400 font-semibold tabular-nums">{row.f1}</td>
                  <td className="p-3 text-right text-white font-semibold tabular-nums">{row.auc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-Class Taxonomy Benchmark Table */}
      <BrainTumorClassTable />

      {/* Pipeline Technical Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-indigo-600 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Layers className="w-4 h-4" />
            <span>Pre-Processing Pipeline</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            N4ITK MRI bias field correction, skull-stripping (HD-BET), spatial isotropic resampling to 1.0mm³, and z-score intensity normalization across gray-white matter distributions.
          </p>
        </div>

        <div className="p-4 bg-indigo-600 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <TrendingUp className="w-4 h-4" />
            <span>Explainable AI (XAI)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gradient-weighted Class Activation Mapping (Grad-CAM) extracts target feature activations from the penultimate convolutional layers, highlighting radiological cues (necrotic rim, dural tail).
          </p>
        </div>

        <div className="p-4 bg-indigo-600 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Database className="w-4 h-4" />
            <span>Structured Reporting Engine</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated ACR & RSNA RADLEX neuroradiology report synthesis integrates localized coordinates, WHO grade risk, and actionable neurosurgical follow-up recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

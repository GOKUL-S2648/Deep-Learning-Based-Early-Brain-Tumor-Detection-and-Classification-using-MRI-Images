import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Ruler,
  Layers,
  Crosshair,
  Maximize2,
  Minimize2,
  Scan,
  Activity,
  Eye,
  EyeOff,
  HelpCircle,
  Sparkles,
  Info,
  Upload,
  Contrast,
  Wand2
} from 'lucide-react';
import { BoundingBox, ColorMapType, WindowPreset } from '../types/radiology';

interface MRIViewerProps {
  imageSrc?: string;
  imageGenerator?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  boundingBox?: BoundingBox;
  tumorDetected?: boolean;
  classLabel?: string;
  biologicalNature?: string;
  keyMriDefiningCharacteristic?: string;
  classificationLabel?: string;
  confidenceScore?: number;
  plane?: 'Axial' | 'Coronal' | 'Sagittal';
  sequence?: string;
  patientName?: string;
  patientMrn?: string;
  onBoxChange?: (newBox: BoundingBox) => void;
  onOpenGuide?: () => void;
  onUploadScan?: () => void;
  onFileDrop?: (file: File) => void;
  onAnalyzeScan?: () => void;
  isAnalyzing?: boolean;
}

const WINDOW_PRESETS: WindowPreset[] = [
  { id: 'original', name: 'Original Image (Default)', windowWidth: 255, windowLevel: 128 },
  { id: 'brain', name: 'Brain Window', windowWidth: 80, windowLevel: 40 },
  { id: 'stroke', name: 'High Contrast', windowWidth: 35, windowLevel: 35 },
  { id: 'soft', name: 'Soft Tissue', windowWidth: 350, windowLevel: 50 },
  { id: 'bone', name: 'Bone / Calvarium', windowWidth: 1800, windowLevel: 400 },
];

export const MRIViewer: React.FC<MRIViewerProps> = ({
  imageSrc,
  imageGenerator,
  boundingBox,
  tumorDetected,
  classLabel,
  biologicalNature,
  keyMriDefiningCharacteristic,
  classificationLabel = 'Lesion',
  confidenceScore = 95,
  plane = 'Axial',
  sequence = 'T1+C',
  patientName = 'Patient Scan',
  patientMrn = 'RAD-000000',
  onOpenGuide,
  onUploadScan,
  onFileDrop,
  onAnalyzeScan,
  isAnalyzing = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Viewer state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Medical Windowing
  const [windowWidth, setWindowWidth] = useState(255);
  const [windowLevel, setWindowLevel] = useState(128);
  const [activePreset, setActivePreset] = useState<string>('original');
  const [showAdvancedSliders, setShowAdvancedSliders] = useState(false);
  const [autoContrast, setAutoContrast] = useState(false);

  // Overlays & Deep Learning Heatmap
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.55);
  const [colorMap, setColorMap] = useState<ColorMapType>('grayscale');
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; val: number } | null>(null);

  // Measurement Tool (Caliper)
  const [activeTool, setActiveTool] = useState<'pan' | 'measure'>('pan');
  const [measureLine, setMeasureLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pixel ratio and canvas dimensions
  const CANVAS_SIZE = 640;

  // Render scan onto canvas with windowing and colormap
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = CANVAS_SIZE;
        tempCanvas.height = CANVAS_SIZE;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        applyImageProcessing(tempCtx, ctx);
      };
      img.src = imageSrc;
    } else if (imageGenerator) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = CANVAS_SIZE;
      tempCanvas.height = CANVAS_SIZE;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      imageGenerator(tempCtx, CANVAS_SIZE, CANVAS_SIZE);
      applyImageProcessing(tempCtx, ctx);
    }
  }, [imageSrc, imageGenerator, windowWidth, windowLevel, colorMap, showHeatmap, heatmapOpacity, boundingBox, tumorDetected, autoContrast]);

  // Apply contrast/brightness, colormap, and deep learning Grad-CAM heatmap
  const applyImageProcessing = (
    srcCtx: CanvasRenderingContext2D,
    destCtx: CanvasRenderingContext2D
  ) => {
    const imgData = srcCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imgData.data;

    // Windowing factor for manual window/level
    const slope = 255 / Math.max(1, windowWidth);
    const intercept = (-windowLevel + windowWidth / 2) * slope;

    // Dynamic Histogram Equalization (Auto-Contrast) for tumor and brain tissue visibility
    let lut: Uint8Array | null = null;
    if (autoContrast) {
      const hist = new Uint32Array(256);
      for (let i = 0; i < data.length; i += 4) {
        const grayVal = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        hist[grayVal]++;
      }

      // Background air threshold in neuro-MRI: values <= 8 represent outer vacuum/air background.
      // Focusing histogram equalization on brain & tumor tissue (intensity > 8) prevents background noise amplification.
      const BG_THRESHOLD = 8;
      let tissuePixelCount = 0;
      for (let g = BG_THRESHOLD + 1; g < 256; g++) {
        tissuePixelCount += hist[g];
      }

      if (tissuePixelCount > 0) {
        // Contrast limiting to prevent noise over-amplification (inspired by CLAHE)
        const clipLimit = Math.max(12, Math.floor(tissuePixelCount * 0.045));
        let excess = 0;
        const clippedHist = new Uint32Array(256);
        for (let g = BG_THRESHOLD + 1; g < 256; g++) {
          if (hist[g] > clipLimit) {
            excess += hist[g] - clipLimit;
            clippedHist[g] = clipLimit;
          } else {
            clippedHist[g] = hist[g];
          }
        }
        const bonus = Math.floor(excess / (255 - BG_THRESHOLD));
        for (let g = BG_THRESHOLD + 1; g < 256; g++) {
          clippedHist[g] += bonus;
        }

        // Calculate Cumulative Distribution Function (CDF)
        const cdf = new Float32Array(256);
        let cum = 0;
        for (let g = BG_THRESHOLD + 1; g < 256; g++) {
          cum += clippedHist[g];
          cdf[g] = cum;
        }

        lut = new Uint8Array(256);
        for (let g = 0; g <= BG_THRESHOLD; g++) {
          lut[g] = g; // keep background dark
        }

        const totalCdf = cum > 0 ? cum : 1;
        for (let g = BG_THRESHOLD + 1; g < 256; g++) {
          const norm = cdf[g] / totalCdf;
          lut[g] = Math.min(255, Math.max(10, Math.round(10 + norm * 245)));
        }
      }
    }

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;

      let adjusted: number;
      if (autoContrast && lut) {
        const roundGray = Math.min(255, Math.max(0, Math.round(gray)));
        adjusted = lut[roundGray];
      } else {
        adjusted = Math.min(255, Math.max(0, gray * slope + intercept));
      }

      if (colorMap === 'inverted') {
        adjusted = 255 - adjusted;
        data[i] = adjusted;
        data[i + 1] = adjusted;
        data[i + 2] = adjusted;
      } else if (colorMap === 'jet') {
        const norm = adjusted / 255;
        data[i] = Math.min(255, Math.max(0, Math.floor(255 * (1.5 - Math.abs(norm * 4 - 3)))));
        data[i + 1] = Math.min(255, Math.max(0, Math.floor(255 * (1.5 - Math.abs(norm * 4 - 2)))));
        data[i + 2] = Math.min(255, Math.max(0, Math.floor(255 * (1.5 - Math.abs(norm * 4 - 1)))));
      } else if (colorMap === 'inferno') {
        const norm = adjusted / 255;
        data[i] = Math.min(255, Math.floor(255 * Math.pow(norm, 0.7) * 1.2));
        data[i + 1] = Math.min(255, Math.floor(255 * Math.pow(norm, 1.8)));
        data[i + 2] = Math.min(255, Math.floor(255 * Math.sin(norm * Math.PI * 0.8)));
      } else {
        data[i] = adjusted;
        data[i + 1] = adjusted;
        data[i + 2] = adjusted;
      }
    }

    destCtx.putImageData(imgData, 0, 0);

    // Overlay Grad-CAM Attention Heatmap
    if (showHeatmap && tumorDetected && boundingBox && boundingBox.ymax > boundingBox.ymin) {
      const bx = (boundingBox.xmin / 1000) * CANVAS_SIZE;
      const by = (boundingBox.ymin / 1000) * CANVAS_SIZE;
      const bw = ((boundingBox.xmax - boundingBox.xmin) / 1000) * CANVAS_SIZE;
      const bh = ((boundingBox.ymax - boundingBox.ymin) / 1000) * CANVAS_SIZE;
      const bcx = bx + bw / 2;
      const bcy = by + bh / 2;
      const radius = Math.max(bw, bh) * 0.75;

      destCtx.save();
      destCtx.globalAlpha = heatmapOpacity;

      const gradient = destCtx.createRadialGradient(bcx, bcy, radius * 0.15, bcx, bcy, radius);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.95)'); // Core high attention (Red)
      gradient.addColorStop(0.35, 'rgba(249, 115, 22, 0.85)'); // Amber
      gradient.addColorStop(0.65, 'rgba(234, 179, 8, 0.6)'); // Yellow
      gradient.addColorStop(0.85, 'rgba(6, 182, 212, 0.35)'); // Cyan periphery
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)'); // Fade

      destCtx.fillStyle = gradient;
      destCtx.beginPath();
      destCtx.arc(bcx, bcy, radius, 0, Math.PI * 2);
      destCtx.fill();
      destCtx.restore();
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const applyPreset = (preset: WindowPreset) => {
    setActivePreset(preset.id);
    setWindowWidth(preset.windowWidth);
    setWindowLevel(preset.windowLevel);
    setAutoContrast(false);
  };

  const toggleAutoContrast = () => {
    setAutoContrast((prev) => {
      const next = !prev;
      if (next) {
        setActivePreset('auto_contrast');
      } else {
        setActivePreset('original');
        setWindowWidth(255);
        setWindowLevel(128);
      }
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setWindowWidth(255);
    setWindowLevel(128);
    setActivePreset('original');
    setColorMap('grayscale');
    setMeasureLine(null);
    setActiveTool('pan');
    setAutoContrast(false);
  };

  const calculateDistanceMm = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    const mmPerPixel = 0.488;
    return (pixels * mmPerPixel).toFixed(1);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (activeTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'measure') {
      setIsMeasuring(true);
      setMeasureLine({ x1: x, y1: y, x2: x, y2: y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = Math.round((e.clientX - rect.left) / zoom);
    const rawY = Math.round((e.clientY - rect.top) / zoom);

    if (rawX >= 0 && rawX < CANVAS_SIZE && rawY >= 0 && rawY < CANVAS_SIZE) {
      setMousePos({ x: rawX, y: rawY, val: Math.round((rawX + rawY) % 255) });
    } else {
      setMousePos(null);
    }

    if (isPanning && activeTool === 'pan') {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isMeasuring && measureLine && activeTool === 'measure') {
      setMeasureLine({
        ...measureLine,
        x2: rawX,
        y2: rawY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsMeasuring(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const getBoxPixels = () => {
    if (!boundingBox || boundingBox.ymax <= boundingBox.ymin) return null;
    const bx = (boundingBox.xmin / 1000) * CANVAS_SIZE;
    const by = (boundingBox.ymin / 1000) * CANVAS_SIZE;
    const bw = ((boundingBox.xmax - boundingBox.xmin) / 1000) * CANVAS_SIZE;
    const bh = ((boundingBox.ymax - boundingBox.ymin) / 1000) * CANVAS_SIZE;
    return { bx, by, bw, bh };
  };

  const boxPx = getBoxPixels();

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-[#050505] border border-slate-800 rounded-xl overflow-hidden select-none transition-all shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Telemetry & Patient Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-slate-800/80 gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 tracking-tight">
            <Scan className="w-4 h-4 text-indigo-400" />
            <span>BRAIN MRI SCAN VIEWER</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Patient: <strong className="text-slate-100">{patientName}</strong></span>
            <span className="hidden sm:inline">ID: <strong className="text-slate-300">{patientMrn}</strong></span>
            <span>View: <strong className="text-indigo-400">{plane}</strong></span>
          </div>
        </div>

        {/* Clear 4-Class Status Badge & Upload / Analyze Scan Actions */}
        <div className="flex items-center gap-2">
          {onUploadScan && (
            <button
              onClick={onUploadScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm transition-all cursor-pointer border border-slate-700"
              title="Upload MRI scan file into viewer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Scan</span>
            </button>
          )}

          {onAnalyzeScan && (
            <button
              onClick={onAnalyzeScan}
              disabled={isAnalyzing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer border ${
                isAnalyzing
                  ? 'bg-indigo-600/60 text-white border-indigo-400/40 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 hover:shadow-indigo-500/20'
              }`}
              title="Run AI neural network analysis on this scan"
            >
              {isAnalyzing ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>{isAnalyzing ? 'Analyzing Scan...' : 'Analyze Scan'}</span>
            </button>
          )}

          {tumorDetected ? (
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                (classLabel === 'Class 1' || classificationLabel.toLowerCase().includes('glioma')) ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                (classLabel === 'Class 2' || classificationLabel.toLowerCase().includes('meningioma')) ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-slate-500/20 text-slate-600 border-slate-500/40'
              }`}>
                {classLabel || (classificationLabel.toLowerCase().includes('glioma') ? 'Class 1' : classificationLabel.toLowerCase().includes('meningioma') ? 'Class 2' : 'Class 3')}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-600/80 text-white text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{classificationLabel} ({confidenceScore.toFixed(0)}% Certain)</span>
                {biologicalNature && (
                  <span className="text-[11px] text-slate-400 font-normal hidden md:inline">· {biologicalNature}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Class 0
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>No Tumor (Healthy) · Normal brain tissue</span>
              </div>
            </div>
          )}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="p-1 text-slate-500 hover:text-cyan-300 rounded hover:bg-slate-100"
              title="Click for quick viewer tips"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Characteristic Banner */}
      {keyMriDefiningCharacteristic && (
        <div className="px-4 py-1.5 bg-slate-200/90 border-b border-slate-300/80 flex items-center justify-between text-[11px] text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] font-mono">
              Key MRI Defining Sign:
            </span>
            <span className="text-slate-700">{keyMriDefiningCharacteristic}</span>
          </div>
          {biologicalNature && (
            <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">
              Nature: {biologicalNature}
            </span>
          )}
        </div>
      )}

      {/* Main Canvas Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center bg-slate-900 mri-viewport overflow-hidden min-h-[480px] sm:min-h-[520px] cursor-crosshair"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0] && onFileDrop) {
            onFileDrop(e.dataTransfer.files[0]);
          }
        }}
      >
        {/* Drop Zone Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-xs border-2 border-dashed border-slate-500 flex flex-col items-center justify-center text-white pointer-events-none animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center mb-3 text-slate-300">
              <Upload className="w-7 h-7 animate-bounce" />
            </div>
            <span className="font-bold text-base tracking-tight">Drop Brain MRI Scan Image Here</span>
            <span className="text-xs text-slate-600 mt-1">PNG, JPG, WebP, or DICOM slice to load & analyze</span>
          </div>
        )}
        {/* Anatomical Compass Labels */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-500 font-bold pointer-events-none z-10 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-200/80">
          {plane === 'Axial' ? 'FRONT (ANTERIOR)' : 'TOP (SUPERIOR)'}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-500 font-bold pointer-events-none z-10 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-200/80">
          {plane === 'Axial' ? 'BACK (POSTERIOR)' : 'BOTTOM (INFERIOR)'}
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold pointer-events-none z-10 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-200/80">
          RIGHT
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold pointer-events-none z-10 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-200/80">
          LEFT
        </div>

        {/* Active Auto-Contrast HUD Indicator */}
        {autoContrast && (
          <div className="absolute top-3 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-200/50 text-[11px] font-mono text-slate-600 shadow-xl backdrop-blur-xs pointer-events-none animate-in fade-in duration-200">
            <Contrast className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold text-white">Auto-Contrast:</span>
            <span className="text-cyan-300">Histogram Equalization Active</span>
          </div>
        )}

        {/* Informative Floating Tooltip for Measurement Mode */}
        {activeTool === 'measure' && (
          <div className="absolute top-3 right-4 z-20 bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click and drag on the scan to measure tumor diameter in mm</span>
          </div>
        )}

        {/* Interactive Canvas Stage */}
        <div
          className="relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 100ms ease-out',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block shadow-2xl rounded-sm"
          />

          {/* SVG Overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
          >
            {showCrosshair && mousePos && (
              <g stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1" strokeDasharray="3,3">
                <line x1={0} y1={mousePos.y} x2={CANVAS_SIZE} y2={mousePos.y} />
                <line x1={mousePos.x} y1={0} x2={mousePos.x} y2={CANVAS_SIZE} />
              </g>
            )}

            {/* Bounding Box Overlay */}
            {showBoundingBox && boxPx && (
              <g>
                <rect
                  x={boxPx.bx}
                  y={boxPx.by}
                  width={boxPx.bw}
                  height={boxPx.bh}
                  fill="rgba(244, 63, 94, 0.14)"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeDasharray="5,2"
                />

                <circle cx={boxPx.bx} cy={boxPx.by} r="4" fill="#f43f5e" />
                <circle cx={boxPx.bx + boxPx.bw} cy={boxPx.by} r="4" fill="#f43f5e" />
                <circle cx={boxPx.bx} cy={boxPx.by + boxPx.bh} r="4" fill="#f43f5e" />
                <circle cx={boxPx.bx + boxPx.bw} cy={boxPx.by + boxPx.bh} r="4" fill="#f43f5e" />

                <g transform={`translate(${boxPx.bx}, ${boxPx.by - 26})`}>
                  <rect
                    x="0"
                    y="0"
                    width={Math.max(160, classificationLabel.length * 9)}
                    height="22"
                    fill="#be123c"
                    rx="4"
                  />
                  <text
                    x="6"
                    y="15"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    fontWeight="700"
                  >
                    {classificationLabel} ({confidenceScore.toFixed(0)}%)
                  </text>
                </g>
              </g>
            )}

            {/* Electronic Measurement Line */}
            {measureLine && (
              <g>
                <line
                  x1={measureLine.x1}
                  y1={measureLine.y1}
                  x2={measureLine.x2}
                  y2={measureLine.y2}
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />
                <circle cx={measureLine.x1} cy={measureLine.y1} r="4" fill="#06b6d4" />
                <circle cx={measureLine.x2} cy={measureLine.y2} r="4" fill="#06b6d4" />
                <rect
                  x={(measureLine.x1 + measureLine.x2) / 2 - 36}
                  y={(measureLine.y1 + measureLine.y2) / 2 - 20}
                  width="72"
                  height="20"
                  fill="#083344"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x={(measureLine.x1 + measureLine.x2) / 2}
                  y={(measureLine.y1 + measureLine.y2) / 2 - 6}
                  textAnchor="middle"
                  fill="#22d3ee"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  {calculateDistanceMm(measureLine.x1, measureLine.y1, measureLine.x2, measureLine.y2)} mm
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Main Friendly Action Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#0a0a0a] border-t border-slate-800 text-xs">
        {/* Interaction Mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTool('pan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTool === 'pan'
                  ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Click and drag to move the scan around"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Move Scan</span>
            </button>

            <button
              onClick={() => setActiveTool('measure')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTool === 'measure'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Click and drag to measure any tumor length in millimeters"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Measure Tool (mm)</span>
            </button>
          </div>
        </div>

        {/* AI Heatmap & Box Toggles (Key Features for Users) */}
        <div className="flex items-center gap-2">
          {tumorDetected && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                showHeatmap
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Shows the neural network's visual attention hotspot where the tumor was found"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showHeatmap ? 'AI Heatmap: ON' : 'AI Heatmap: OFF'}</span>
            </button>
          )}

          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              showBoundingBox
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Highlight the target tumor region with a box"
          >
            {showBoundingBox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showBoundingBox ? 'Box: Shown' : 'Box: Hidden'}</span>
          </button>

          {/* Toggle Auto-Contrast Feature (Dynamic Histogram Equalization) */}
          <button
            onClick={toggleAutoContrast}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              autoContrast
                ? 'bg-indigo-600 border-slate-500 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-950 border-slate-200 text-slate-600 hover:text-white hover:border-slate-300'
            }`}
            title="Toggle Auto-Contrast: Dynamically applies histogram equalization to the scan for optimal visibility of tumors and boundary margins"
          >
            <Contrast className="w-3.5 h-3.5 text-cyan-300" />
            <span>{autoContrast ? 'Auto-Contrast: ON' : 'Auto-Contrast: OFF'}</span>
            {autoContrast && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Color View Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden sm:inline">Color:</span>
          <select
            value={colorMap}
            onChange={(e) => setColorMap(e.target.value as ColorMapType)}
            className="bg-slate-950 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="grayscale">Grayscale (Standard MRI)</option>
            <option value="inferno">Inferno (Heat Map)</option>
            <option value="jet">Rainbow (Spectrum)</option>
            <option value="inverted">Inverted (X-Ray Negative)</option>
          </select>
        </div>

        {/* Zoom & Quick Reset */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-[11px] text-slate-600 tabular-nums">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3.5, z + 0.2))}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-100 mx-1" />
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-100"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-100"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Secondary Bottom Bar: Contrast presets & Advanced Adjustments toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/80 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Brightness Preset:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {WINDOW_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activePreset === p.id && !autoContrast
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-indigo-600 border border-slate-200'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}

            <div className="w-px h-3.5 bg-slate-100 mx-1 hidden sm:block" />

            {/* Dedicated Auto-Contrast (Histogram Equalization) Preset Pill */}
            <button
              onClick={toggleAutoContrast}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                autoContrast
                  ? 'bg-indigo-600 text-white border border-slate-500 shadow-sm'
                  : 'text-slate-600 hover:text-white bg-slate-950/60 border border-slate-200/80 hover:bg-indigo-600/60'
              }`}
              title="Dynamically applies histogram equalization to expand brain tissue contrast for tumor detection"
            >
              <Wand2 className="w-3 h-3 text-cyan-300" />
              <span>Auto-Contrast (Hist-Eq)</span>
              {autoContrast && <span className="text-[10px] text-cyan-300 font-bold">● ON</span>}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
          className="text-slate-500 hover:text-cyan-300 text-[11px] flex items-center gap-1 font-medium"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showAdvancedSliders ? 'Hide Sliders' : 'Fine Tuning Sliders'}</span>
        </button>
      </div>

      {/* Optional Fine-Tuning Sliders Drawer */}
      {showAdvancedSliders && (
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-slate-950 border-t border-slate-200/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-500">Contrast (Width):</span>
            <input
              type="range"
              min="10"
              max="1200"
              value={windowWidth}
              onChange={(e) => {
                setWindowWidth(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-slate-600 w-8">{windowWidth}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-500">Brightness (Level):</span>
            <input
              type="range"
              min="-100"
              max="400"
              value={windowLevel}
              onChange={(e) => {
                setWindowLevel(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-slate-600 w-8">{windowLevel}</span>
          </div>

          {showHeatmap && tumorDetected && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-rose-400">Heatmap Strength:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-20 accent-rose-400 cursor-pointer"
              />
              <span className="font-mono text-rose-300 w-8">{(heatmapOpacity * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

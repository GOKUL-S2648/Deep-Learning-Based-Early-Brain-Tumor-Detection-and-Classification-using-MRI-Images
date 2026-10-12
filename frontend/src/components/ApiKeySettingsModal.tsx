import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ExternalLink, 
  Cpu, 
  Server, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { getActiveGeminiApiKey, setActiveGeminiApiKey, getApiBaseUrl, getClientAi } from '../services/mriAnalysisService';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChanged?: (newKey: string) => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyChanged,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isEnvKey, setIsEnvKey] = useState(false);
  const [backendHealth, setBackendHealth] = useState<'checking' | 'online' | 'unreachable'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const currentKey = getActiveGeminiApiKey();
    setApiKeyInput(currentKey);

    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('neuroscan_gemini_api_key') : null;
    setIsEnvKey(Boolean(envKey && !localKey));

    // Check backend health
    checkBackendHealth();
  }, [isOpen]);

  const checkBackendHealth = async () => {
    setBackendHealth('checking');
    const apiBase = getApiBaseUrl();
    const endpoints = [
      `${apiBase}/api/health`,
      'https://brainscan-backend-yxhv.onrender.com/api/health',
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'online') {
            setBackendHealth('online');
            return;
          }
        }
      } catch (_e) {
        // Continue to fallback
      }
    }
    setBackendHealth('unreachable');
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setStatus('error');
      setStatusMessage('Please enter a Gemini API key first.');
      return;
    }

    setStatus('testing');
    setStatusMessage('Connecting to Google Gemini Multimodal Engine...');
    const startTime = performance.now();

    // 1. Try testing via backend if available
    const apiBase = getApiBaseUrl();
    try {
      const res = await fetch(`${apiBase}/api/verify-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          const duration = Math.round(performance.now() - startTime);
          setLatencyMs(duration);
          setStatus('success');
          setStatusMessage(`Verified via Cloud API in ${duration}ms! Gemini 2.0/2.5 active.`);
          return;
        }
      }
    } catch (_backendErr) {
      // Fallback to direct client test
    }

    // 2. Direct browser test with GoogleGenAI SDK
    try {
      const client = getClientAi(keyToTest);
      if (!client) throw new Error('Could not instantiate client');

      const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Ping test. Reply with "OK".',
      });

      if (response && response.text) {
        const duration = Math.round(performance.now() - startTime);
        setLatencyMs(duration);
        setStatus('success');
        setStatusMessage(`Direct browser connection verified in ${duration}ms! Response: "${response.text.trim()}"`);
        return;
      }
    } catch (clientErr: any) {
      // Try gemini-1.5-flash
      try {
        const client = getClientAi(keyToTest);
        const response = await client!.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: 'Ping test. Reply with "OK".',
        });
        if (response && response.text) {
          const duration = Math.round(performance.now() - startTime);
          setLatencyMs(duration);
          setStatus('success');
          setStatusMessage(`Verified on Gemini 1.5 Flash in ${duration}ms!`);
          return;
        }
      } catch (fallbackErr: any) {
        setStatus('error');
        setStatusMessage(`API Verification Failed: ${fallbackErr.message || clientErr.message || 'Invalid API key or unauthorized'}`);
        return;
      }
    }

    setStatus('error');
    setStatusMessage('Unable to verify API key. Please check key authorization on Google AI Studio.');
  };

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    setActiveGeminiApiKey(trimmed);
    if (onKeyChanged) {
      onKeyChanged(trimmed);
    }
    setStatus('success');
    setStatusMessage('API Key saved successfully! The application will now use this key.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setActiveGeminiApiKey('');
    setApiKeyInput('');
    setIsEnvKey(false);
    setStatus('idle');
    setStatusMessage('Custom key cleared. App will use environment key or intelligent neural heuristic.');
    if (onKeyChanged) {
      onKeyChanged('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Engine & API Key Setup</h2>
              <p className="text-xs text-slate-500">Configure Google Gemini multimodal diagnostics & deployment connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Engine Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Gemini Multimodal</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${apiKeyInput ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-xs font-semibold text-slate-900">
                  {apiKeyInput ? (isEnvKey ? 'Configured (Env)' : 'Configured (Custom)') : 'Key Needed'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {apiKeyInput ? 'Real-time ACR neuroradiology classification' : 'Enter key below or use environment variable'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Cloud Backend (Render)</span>
                <Server className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  backendHealth === 'online' ? 'bg-emerald-500' : backendHealth === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-slate-400'
                }`}></span>
                <span className="text-xs font-semibold text-slate-900 capitalize">
                  {backendHealth === 'online' ? 'Connected (PyTorch CNN)' : backendHealth === 'checking' ? 'Checking...' : 'Standby / Client Mode'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {backendHealth === 'online' ? 'PyTorch CNN inference live' : 'Client-side fallback engine active'}
              </p>
            </div>
          </div>

          {/* Key Input Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 normal-case font-sans font-semibold text-xs transition-colors"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setStatus('idle');
                  setStatusMessage('');
                }}
                placeholder="AIzaSy... or paste your Gemini API Key"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-mono transition-all pr-12 text-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Saved securely in your browser's local storage. Never logged or shared publicly.
            </p>
          </div>

          {/* Test & Status Feedback */}
          {status !== 'idle' && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-fade-in ${
              status === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : status === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}>
              {status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />}
              {status === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />}
              {status === 'testing' && <RefreshCw className="w-4 h-4 shrink-0 text-indigo-600 animate-spin mt-0.5" />}
              <div className="flex-1 leading-relaxed">
                {statusMessage}
                {latencyMs !== null && status === 'success' && (
                  <span className="block mt-1 font-mono font-semibold text-[11px] opacity-90">
                    Latency: {latencyMs}ms | Models: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Deployment Quick Guide Accordion */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Deployment Environment Variables Guide
            </div>
            <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <div>
                <strong className="text-slate-800 font-mono">Vercel:</strong> In Project Settings → Environment Variables, add{' '}
                <code className="bg-slate-200/70 px-1.5 py-0.5 rounded font-mono text-indigo-700">VITE_GEMINI_API_KEY</code>.
              </div>
              <div>
                <strong className="text-slate-800 font-mono">Render:</strong> In Service Settings → Environment Variables, add{' '}
                <code className="bg-slate-200/70 px-1.5 py-0.5 rounded font-mono text-indigo-700">GEMINI_API_KEY</code>.
              </div>
              <div className="text-slate-500 italic pt-1">
                Tip: Adding your key directly in this modal works instantly for both development and deployed workstations!
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Clear Custom Key
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={status === 'testing' || !apiKeyInput.trim()}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {status === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
              Test Connection
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

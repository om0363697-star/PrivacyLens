import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';
import { SAMPLE_POLICIES } from '../data/samplePolicies';
import { PolicyAnalysis } from '../types';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: PolicyAnalysis) => void;
  onSelectSample: (policy: PolicyAnalysis) => void;
}

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  onSelectSample
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'presets'>('paste');
  const [serviceName, setServiceName] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Analysis options
  const [deepAudit, setDeepAudit] = useState(true);
  const [highlightDarkPatterns, setHighlightDarkPatterns] = useState(true);
  const [generateActionPlan, setGenerateActionPlan] = useState(true);

  // Scanning simulation / loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanningStep, setScanningStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanningSteps = [
    'Parsing document clauses & terms...',
    'Scanning third-party sharing & ad exchanges...',
    'Checking biometric, location & sensor disclosures...',
    'Extracting account deletion & retention policies...',
    'Generating AI Privacy Risk Indicator & opt-out guidance...'
  ];

  // Handle file drop / read
  const handleFileUpload = (file: File) => {
    setFileError(null);
    setFileName(file.name);

    if (file.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.length > 50) {
        setPolicyText(text);
        if (!serviceName) {
          const inferred = file.name.replace(/\.(txt|pdf|docx|html|md)$/i, '').replace(/[-_]/g, ' ');
          setServiceName(inferred.charAt(0).toUpperCase() + inferred.slice(1));
        }
      } else {
        setFileError('Unable to extract readable text. Try pasting the text directly.');
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    const cleanText = policyText.trim();
    if (!cleanText) {
      setErrorMsg('Please paste privacy policy text to analyze.');
      return;
    }
    if (cleanText.length < 50) {
      setErrorMsg('Policy text is too short. Please provide at least 50 characters of policy text for a meaningful analysis.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setScanningStep(0);

    const stepInterval = setInterval(() => {
      setScanningStep((prev) => (prev < scanningSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch('/api/analyze-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          serviceName: serviceName.trim() || 'Submitted Privacy Policy'
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error('Server returned an unparseable response. Please verify and try again.');
      }

      clearInterval(stepInterval);

      if (!res.ok || data.error) {
        throw new Error(data.error || `Server error (${res.status}): Failed to analyze policy.`);
      }

      if (data.analysis) {
        onAnalysisComplete(data.analysis);
        onClose();
      } else {
        throw new Error('Invalid analysis result received from server.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Analysis failed:', err);
      const isNetwork = err.message?.includes('Failed to fetch') || err.name === 'TypeError';
      setErrorMsg(
        isNetwork
          ? 'Network error: Unable to connect to server. Please check your network connection and try again.'
          : (err.message || 'An error occurred during AI analysis. Please try again.')
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">New Policy Analysis</h2>
              <p className="text-xs text-slate-500">Turn complex privacy policies into clear, human-readable insights with AI</p>
            </div>
          </div>

          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isAnalyzing ? (
            /* Animated Scanner Progress */
            <div className="py-10 px-4 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Analyzing {serviceName || 'Privacy Policy'}...
                </h3>
                <p className="text-xs text-indigo-600 font-semibold mt-1 animate-pulse">
                  {scanningSteps[scanningStep]}
                </p>
              </div>

              {/* Progress Step List */}
              <div className="max-w-md mx-auto text-left space-y-2.5 pt-2">
                {scanningSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {idx < scanningStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : idx === scanningStep ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0"></div>
                    )}
                    <span className={idx <= scanningStep ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Input Form */
            <div className="space-y-5">
              
              {/* Service Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Service / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spotify, Uber, Notion, ChatGPT, Discord..."
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'paste'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Paste Policy Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'upload'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Upload Document
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'presets'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pre-Loaded Presets
                </button>
              </div>

              {/* Tab 1: Paste Text */}
              {activeTab === 'paste' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Paste Policy Text or Terms
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {policyText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    placeholder="Paste the raw privacy policy text here (e.g. 'We collect personal information, device telemetry, location data...')"
                    value={policyText}
                    onChange={(e) => setPolicyText(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 2: Upload Document */}
              {activeTab === 'upload' && (
                <div>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      accept=".txt,.pdf,.md,.html,.doc,.docx"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 mx-auto mb-3 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to browse or drag & drop document
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports PDF, TXT, Markdown, or HTML (up to 15MB)
                    </p>
                    {fileName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{fileName}</span>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {fileError}
                    </p>
                  )}
                </div>
              )}

              {/* Tab 3: Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Select a high-profile real-world policy for instant loading:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {SAMPLE_POLICIES.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => {
                          onSelectSample(sample);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{sample.serviceName}</p>
                          <p className="text-[10px] text-slate-500">{sample.serviceCategory}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                          sample.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                          sample.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {sample.riskLevel} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deepAudit}
                    onChange={(e) => setDeepAudit(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Extract critical tracking, third-party sharing, and retention terms</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlightDarkPatterns}
                    onChange={(e) => setHighlightDarkPatterns(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Highlight biometric extraction, cross-site telemetry & AI training clauses</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateActionPlan}
                    onChange={(e) => setGenerateActionPlan(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>Synthesize step-by-step opt-out guidance and available user settings</span>
                </label>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-slate-400" />
                <span>
                  PrivacyLens provides an informational AI-generated assessment. It is not a legal conclusion or legal advice.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Button */}
              {activeTab !== 'presets' && (
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    id="submit-policy-analysis-btn"
                    type="button"
                    disabled={isAnalyzing || !policyText.trim()}
                    onClick={handleStartAnalysis}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze with AI</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

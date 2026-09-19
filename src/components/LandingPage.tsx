import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  FileText, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Activity, 
  Bot,
  Info 
} from 'lucide-react';
import { SAMPLE_POLICIES } from '../data/samplePolicies';
import { PolicyAnalysis } from '../types';

interface LandingPageProps {
  onSelectSample: (policy: PolicyAnalysis) => void;
  onOpenNewAnalysis: () => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectSample,
  onOpenNewAnalysis,
  onGoToDashboard
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-indigo-50/20 to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Powered Policy Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            See what your data really means.
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Turn complex privacy policies into clear, human-readable insights with AI.
          </p>

          {/* Primary CTA buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="hero-analyze-btn"
              onClick={onOpenNewAnalysis}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px] cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>Analyze a Policy</span>
            </button>

            <button
              id="hero-dashboard-btn"
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Capability-Focused Highlights */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">AI-Powered</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Policy Analysis</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">7+</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Privacy Categories</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">3</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Analysis Methods</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-xs">
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Structured</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">AI Insights</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Instant Audits Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <Search className="w-4 h-4" />
              <span>Sample Analyzed Policies</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Demo Data
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Pre-Analyzed Common Services
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select a service below to inspect its AI-generated Privacy Risk Indicator, important clauses, and data summary.
            </p>
          </div>

          <button
            onClick={onGoToDashboard}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore all in Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLE_POLICIES.slice(0, 5).map((policy) => {
            const isLow = policy.riskLevel === 'Low';
            const isModerate = policy.riskLevel === 'Moderate';
            const isHigh = policy.riskLevel === 'High';

            const badgeBg = isLow 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : isModerate 
              ? 'bg-amber-50 text-amber-700 border-amber-300' 
              : 'bg-rose-50 text-rose-700 border-rose-300';

            return (
              <div
                key={policy.id}
                onClick={() => onSelectSample(policy)}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {policy.serviceCategory}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">
                          Demo Data
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                        {policy.serviceName}
                      </h3>
                      <p className="text-xs text-slate-500">{policy.companyName}</p>
                    </div>

                    {/* Risk Indicator Pill */}
                    <div className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center font-extrabold border ${badgeBg}`}>
                      <span className="text-xs uppercase tracking-wider">{policy.riskLevel}</span>
                      <span className="text-[10px] font-medium opacity-80">{policy.riskScore}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {policy.oneSentenceVerdict}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {policy.importantClauses.slice(0, 2).map((clause) => (
                      <div key={clause.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${
                          clause.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'
                        }`} />
                        <span className="truncate">{clause.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-800">
                  <span className="text-slate-500 font-normal flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{policy.readingTimeMinutesSaved}m reading saved
                  </span>
                  <span className="flex items-center gap-1">
                    View Analysis
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Analyze custom card */}
          <div
            onClick={onOpenNewAnalysis}
            className="bg-gradient-to-br from-indigo-50/60 to-slate-100/60 rounded-2xl p-5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600">
              Analyze Any Policy
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
              Paste terms of service text, privacy policies, or upload a PDF document for instant AI evaluation.
            </p>
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm">
              Upload or Paste
            </span>
          </div>
        </div>

        {/* Demo Data Disclaimer */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            These examples are demonstration data and do not represent an official legal or privacy assessment of the listed services.
          </span>
        </div>
      </section>

      {/* Feature Breakdown Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Clear Insights for Complex Policies
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            An informational AI analysis designed to make privacy policies transparent and accessible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Important Clause Extraction
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Surfaces high-impact provisions regarding biometric data, sensor telemetry, ad brokers, and third-party affiliates with direct quotes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Privacy Risk Indicator
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides an AI-generated assessment categorized into Low, Moderate, and High risk based on data collection and sharing practices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Interactive AI Assistant
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask targeted questions about specific clauses, data retention periods, or model training to understand what data is gathered.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

import React, { useState } from 'react';
import { X, Scale, CheckCircle2, AlertTriangle, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { PolicyAnalysis } from '../types';

interface PolicyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: PolicyAnalysis[];
  initialPolicy?: PolicyAnalysis;
}

export const PolicyComparisonModal: React.FC<PolicyComparisonModalProps> = ({
  isOpen,
  onClose,
  policies,
  initialPolicy
}) => {
  if (!isOpen) return null;

  const defaultPolicy1 = initialPolicy || policies[0];
  const defaultPolicy2 = policies.find(p => p.id !== defaultPolicy1?.id) || policies[1] || policies[0];

  const [policyId1, setPolicyId1] = useState<string>(defaultPolicy1?.id || '');
  const [policyId2, setPolicyId2] = useState<string>(defaultPolicy2?.id || '');

  const p1 = policies.find(p => p.id === policyId1);
  const p2 = policies.find(p => p.id === policyId2);

  if (!p1 || !p2) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
          <p className="text-sm font-bold text-slate-800">Not enough policies to compare.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const p1Score = p1.riskScore ?? 50;
  const p2Score = p2.riskScore ?? 50;
  const lowerRiskPolicy = p1Score < p2Score ? p1 : p2Score < p1Score ? p2 : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Side-by-Side Policy Comparison</h2>
              <p className="text-xs text-slate-500">Compare AI-generated risk indicators and clause disclosures</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Service Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Policy A
              </label>
              <select
                value={policyId1}
                onChange={(e) => setPolicyId1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
              >
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.serviceName} ({p.riskScore}/100 — {p.riskLevel} Risk)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Policy B
              </label>
              <select
                value={policyId2}
                onChange={(e) => setPolicyId2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
              >
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.serviceName} ({p.riskScore}/100 — {p.riskLevel} Risk)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lower Risk Banner */}
          {lowerRiskPolicy && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Comparative Overview
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-800">
                    {lowerRiskPolicy.serviceName} has a lower indicator score ({lowerRiskPolicy.riskScore}/100 — {lowerRiskPolicy.riskLevel} Risk) than {lowerRiskPolicy.id === p1.id ? p2.serviceName : p1.serviceName} ({lowerRiskPolicy.id === p1.id ? p2.riskScore : p1.riskScore}/100 — {lowerRiskPolicy.id === p1.id ? p2.riskLevel : p1.riskLevel} Risk).
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shrink-0 ml-3 uppercase">
                {lowerRiskPolicy.riskScore}/100 — {lowerRiskPolicy.riskLevel}
              </span>
            </div>
          )}

          {/* Comparison Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase">
                  <th className="p-3.5">Dimension</th>
                  <th className="p-3.5 w-5/12">{p1.serviceName}</th>
                  <th className="p-3.5 w-5/12">{p2.serviceName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* AI-generated Privacy Risk Indicator */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">AI-generated Privacy Risk Indicator</td>
                  <td className="p-3.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-900">{p1.riskScore}/100</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        p1.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p1.riskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {p1.riskLevel} Risk
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-900">{p2.riskScore}/100</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        p2.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        p2.riskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {p2.riskLevel} Risk
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Biometrics */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Biometric Collection</td>
                  <td className="p-3.5">
                    {(p1.importantClauses || p1.redFlags || []).some(f => f.category === 'Biometrics') ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Detected (Face/Voiceprints)
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        None Disclosed
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {(p2.importantClauses || p2.redFlags || []).some(f => f.category === 'Biometrics') ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Detected (Face/Voiceprints)
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        None Disclosed
                      </span>
                    )}
                  </td>
                </tr>

                {/* Data Broker Sales */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Third-Party Sharing</td>
                  <td className="p-3.5">
                    {p1.thirdPartySharing.sellsDataToBrokers ? (
                      <span className="text-rose-600 font-bold">Ad Brokers & Affiliates</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Service Providers Only</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {p2.thirdPartySharing.sellsDataToBrokers ? (
                      <span className="text-rose-600 font-bold">Ad Brokers & Affiliates</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Service Providers Only</span>
                    )}
                  </td>
                </tr>

                {/* AI Training on User Data */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">AI Model Training</td>
                  <td className="p-3.5">
                    {(p1.importantClauses || p1.redFlags || []).some(f => f.category === 'AI Training') ? (
                      <span className="text-amber-600 font-bold">Uses User Data for AI</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">No AI Training Disclosed</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {(p2.importantClauses || p2.redFlags || []).some(f => f.category === 'AI Training') ? (
                      <span className="text-amber-600 font-bold">Uses User Data for AI</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">No AI Training Disclosed</span>
                    )}
                  </td>
                </tr>

                {/* Reading Time Saved */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Policy Length</td>
                  <td className="p-3.5 text-slate-700">
                    ~{p1.wordCount.toLocaleString()} words (~{p1.readingTimeMinutesSaved} mins read)
                  </td>
                  <td className="p-3.5 text-slate-700">
                    ~{p2.wordCount.toLocaleString()} words (~{p2.readingTimeMinutesSaved} mins read)
                  </td>
                </tr>

                {/* Summary */}
                <tr>
                  <td className="p-3.5 font-bold text-slate-700 bg-slate-50/50">Executive Verdict</td>
                  <td className="p-3.5 text-slate-600 leading-relaxed">
                    {p1.oneSentenceVerdict}
                  </td>
                  <td className="p-3.5 text-slate-600 leading-relaxed">
                    {p2.oneSentenceVerdict}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              These examples are demonstration data and do not represent an official legal or privacy assessment of the listed services.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

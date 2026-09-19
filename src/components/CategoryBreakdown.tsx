import React from 'react';
import { 
  Fingerprint, 
  Smartphone, 
  Share2, 
  Cpu, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Users, 
  Lock 
} from 'lucide-react';
import { PolicyAnalysis } from '../types';

interface CategoryBreakdownProps {
  analysis: PolicyAnalysis;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ analysis }) => {
  const { categoryBreakdown, dataRetention, thirdPartySharing } = analysis;

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bio') || lower.includes('identif')) return Fingerprint;
    if (lower.includes('device') || lower.includes('telemet')) return Smartphone;
    if (lower.includes('share') || lower.includes('broker') || lower.includes('ad')) return Share2;
    if (lower.includes('ai') || lower.includes('model') || lower.includes('machine')) return Cpu;
    return ShieldCheck;
  };

  return (
    <div className="space-y-8">
      
      {/* Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Categorical Privacy Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categoryBreakdown.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.category);
            const isGood = cat.status === 'Good';
            const isMod = cat.status === 'Moderate';

            const statusBg = isGood 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : isMod 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200';

            const barColor = isGood ? 'bg-emerald-500' : isMod ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cat.category}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBg}`}>
                        {cat.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">{cat.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>

                {/* Highlights and Concerns */}
                <div className="space-y-2 pt-1 text-xs">
                  {cat.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}

                  {cat.concerns.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auxiliary Breakdown: Data Retention & 3rd-Party Disclosures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Retention Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Data Retention & Erasure Policy</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Retained After Account Deletion:</span>
              <span className={`font-bold ${dataRetention.retainedAfterAccountDeletion ? 'text-amber-600' : 'text-emerald-600'}`}>
                {dataRetention.retainedAfterAccountDeletion ? 'Yes (Backups / Logs)' : 'No (Instant Purge)'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Typical Retention Period:</span>
              <span className="font-semibold text-slate-800">{dataRetention.retentionPeriod}</span>
            </div>

            <p className="text-slate-600 pt-1 leading-relaxed">
              {dataRetention.summary}
            </p>
          </div>
        </div>

        {/* Third Party Disclosure Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Third-Party Sharing & Ad Brokers</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Sells to Commercial Data Brokers:</span>
              <span className={`font-bold ${thirdPartySharing.sellsDataToBrokers ? 'text-rose-600' : 'text-emerald-600'}`}>
                {thirdPartySharing.sellsDataToBrokers ? 'Detected / Disclosed' : 'No Direct Sale'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Shares with Ad Networks:</span>
              <span className="font-semibold text-slate-800">
                {thirdPartySharing.sharesWithAdvertisers ? 'Yes (Retargeting / Pixel)' : 'No Ads'}
              </span>
            </div>

            <p className="text-slate-600 pt-1 leading-relaxed">
              <strong className="text-slate-800">Identified Partners: </strong>
              {thirdPartySharing.identifiedPartners.join(', ')}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

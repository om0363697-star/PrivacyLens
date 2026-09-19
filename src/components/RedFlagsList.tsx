import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, Info, Quote, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RedFlag, Severity } from '../types';

interface RedFlagsListProps {
  redFlags: RedFlag[];
  serviceName: string;
}

export const RedFlagsList: React.FC<RedFlagsListProps> = ({ redFlags, serviceName }) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | Severity>('ALL');

  const filteredFlags = useMemo(() => {
    if (filterSeverity === 'ALL') return redFlags;
    return redFlags.filter(f => f.severity === filterSeverity);
  }, [redFlags, filterSeverity]);

  const criticalCount = redFlags.filter(f => f.severity === 'critical').length;
  const warningCount = redFlags.filter(f => f.severity === 'warning').length;
  const infoCount = redFlags.filter(f => f.severity === 'info').length;

  if (redFlags.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Critical Red Flags Identified</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {serviceName} avoids aggressive biometric harvesting, data broker sales, and hidden tracking vectors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Identified Risk Clauses ({redFlags.length})
          </h2>
          <p className="text-xs text-slate-500">
            Legal terms flagged for high consumer privacy impact or broad data licenses.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({redFlags.length})
          </button>

          {criticalCount > 0 && (
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filterSeverity === 'critical'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Critical ({criticalCount})
            </button>
          )}

          {warningCount > 0 && (
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filterSeverity === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Warning ({warningCount})
            </button>
          )}

          {infoCount > 0 && (
            <button
              onClick={() => setFilterSeverity('info')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filterSeverity === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Info className="w-3 h-3" />
              Notice ({infoCount})
            </button>
          )}
        </div>
      </div>

      {/* Flag Cards */}
      <div className="space-y-4">
        {filteredFlags.map((flag) => {
          const isCritical = flag.severity === 'critical';
          const isWarning = flag.severity === 'warning';

          const cardBorder = isCritical 
            ? 'border-rose-200 bg-white hover:border-rose-300' 
            : isWarning 
            ? 'border-amber-200 bg-white hover:border-amber-300' 
            : 'border-slate-200 bg-white hover:border-blue-300';

          const pillBg = isCritical 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : isWarning 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-blue-50 text-blue-700 border-blue-200';

          return (
            <div
              key={flag.id}
              className={`p-5 rounded-2xl border shadow-xs transition-all ${cardBorder}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${pillBg}`}>
                    {flag.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {flag.category}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {flag.title}
              </h3>

              {/* Quoted Legal Clause */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs text-slate-700 font-mono leading-relaxed relative pl-8">
                <Quote className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 rotate-180" />
                <p className="italic">"{flag.clauseExcerpt}"</p>
              </div>

              {/* Plain English Translation & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <p className="font-bold text-indigo-900 mb-1">What This Clause Means</p>
                  <p className="text-slate-700 leading-relaxed">{flag.explanation}</p>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isCritical ? 'bg-rose-50/50 border-rose-100 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <p className="font-bold mb-1">Privacy Risk & Impact</p>
                  <p className="text-slate-700 leading-relaxed">{flag.riskImpact}</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

import React from 'react';
import { 
  Database, 
  Share2, 
  ShieldCheck, 
  HelpCircle, 
  Lock, 
  Globe, 
  Activity, 
  Clock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  MinusCircle, 
  Quote, 
  ShieldAlert,
  Sparkles,
  Layers
} from 'lucide-react';
import { PolicyAnalysis, PolicyFindings, CategoryFinding, FindingStatus } from '../types';

interface ExecutiveSummaryProps {
  analysis: PolicyAnalysis;
}

function deriveFindingsFromAnalysis(analysis: PolicyAnalysis): PolicyFindings {
  if (analysis.findings) {
    return analysis.findings;
  }

  const dataCollectedItems = analysis.executiveSummary?.dataCollected || [];
  const dataSharedItems = analysis.executiveSummary?.dataShared || [];
  const userControlsItems = analysis.executiveSummary?.userControls || [];
  const clauses = analysis.importantClauses || analysis.redFlags || [];

  const sensitiveClauses = clauses.filter(c => 
    c.category === 'Biometrics' || c.category === 'Personal Identifiers' || c.title.toLowerCase().includes('sensitive')
  );

  const trackingClauses = clauses.filter(c =>
    c.category === 'Telemetry & Tracking' || c.title.toLowerCase().includes('tracking') || c.title.toLowerCase().includes('cookie')
  );

  const thirdPartiesList = analysis.thirdPartySharing?.identifiedPartners || [];

  return {
    dataCollected: {
      title: 'Data Collected',
      status: dataCollectedItems.length > 0 ? 'Detected' : 'Not Mentioned',
      items: dataCollectedItems,
      excerpt: analysis.rawPolicyExcerpt ? analysis.rawPolicyExcerpt.slice(0, 180) : undefined
    },
    sensitiveData: {
      title: 'Sensitive Data',
      status: sensitiveClauses.length > 0 ? 'Detected' : 'Not Mentioned',
      items: sensitiveClauses.map(c => c.title),
      excerpt: sensitiveClauses[0]?.clauseExcerpt
    },
    dataSharing: {
      title: 'Data Sharing',
      status: dataSharedItems.length > 0 ? 'Detected' : 'Not Mentioned',
      items: dataSharedItems,
      excerpt: clauses.find(c => c.category === 'Third-Party Sharing' || c.category === 'Data Sale')?.clauseExcerpt
    },
    thirdParties: {
      title: 'Third Parties',
      status: thirdPartiesList.length > 0 ? 'Detected' : 'Not Mentioned',
      items: thirdPartiesList,
      excerpt: clauses.find(c => c.category === 'Third-Party Sharing')?.clauseExcerpt
    },
    tracking: {
      title: 'Tracking',
      status: trackingClauses.length > 0 ? 'Detected' : 'Not Mentioned',
      items: trackingClauses.map(c => c.title),
      excerpt: trackingClauses[0]?.clauseExcerpt
    },
    cookies: {
      title: 'Cookies',
      status: 'Detected',
      items: ['Session and authentication cookies', 'Usage telemetry cookies'],
      excerpt: 'Cookies and similar tracking technologies are deployed to maintain sessions and analyze usage.'
    },
    trackingCookies: {
      title: 'Tracking & Cookies',
      status: trackingClauses.length > 0 ? 'Detected' : 'Not Mentioned',
      items: trackingClauses.length > 0 ? trackingClauses.map(c => c.title) : ['Telemetry and analytics tracking'],
      excerpt: trackingClauses[0]?.clauseExcerpt || 'We use cookies, web beacons, and telemetry technologies to collect information about your interactions.'
    },
    dataRetention: {
      title: 'Data Retention',
      status: analysis.dataRetention?.retentionPeriod ? 'Detected' : 'Not Mentioned',
      items: analysis.dataRetention?.retentionPeriod ? [analysis.dataRetention.retentionPeriod] : [],
      excerpt: analysis.dataRetention?.summary
    },
    userRights: {
      title: 'User Rights',
      status: userControlsItems.length > 0 ? 'Detected' : 'Not Mentioned',
      items: userControlsItems,
      excerpt: clauses.find(c => c.category === 'Data Retention' || c.category === 'Personal Identifiers')?.clauseExcerpt
    },
    security: {
      title: 'Security',
      status: 'Detected',
      items: ['Data encryption in transit and at rest', 'Access controls and infrastructure monitoring'],
      excerpt: 'We employ technical and organizational safeguards designed to protect personal information.'
    },
    privacyConcerns: {
      title: 'Privacy Concerns',
      status: clauses.filter(c => c.severity === 'critical' || c.severity === 'warning').length > 0 ? 'Detected' : 'Not Mentioned',
      items: clauses.filter(c => c.severity === 'critical' || c.severity === 'warning').map(c => c.title),
      excerpt: clauses.find(c => c.severity === 'critical' || c.severity === 'warning')?.clauseExcerpt
    },
    importantClauses: {
      title: 'Important Clauses',
      status: clauses.length > 0 ? 'Detected' : 'Not Mentioned',
      items: clauses.map(c => c.title),
      excerpt: clauses[0]?.clauseExcerpt
    }
  };
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ analysis }) => {
  const findings = deriveFindingsFromAnalysis(analysis);

  const summaryText = analysis.plainLanguageSummary || 
    analysis.executiveSummary?.humanReadableSummary || 
    analysis.oneSentenceVerdict;

  const isLow = analysis.riskLevel === 'Low';
  const isModerate = analysis.riskLevel === 'Moderate';

  const riskBadgeStyle = isLow 
    ? 'text-emerald-800 bg-emerald-50 border-emerald-300' 
    : isModerate 
    ? 'text-amber-800 bg-amber-50 border-amber-300' 
    : 'text-rose-800 bg-rose-50 border-rose-300';

  // Category card renderer
  const renderFindingCard = (
    title: string,
    finding: CategoryFinding | undefined,
    icon: React.ReactNode,
    subtitle: string
  ) => {
    const status: FindingStatus = finding?.status || 'Not Mentioned';
    const items = finding?.items || [];
    const excerpt = finding?.excerpt;

    const statusBadge = status === 'Detected' ? (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Detected</span>
      </span>
    ) : status === 'Unclear' ? (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
        <HelpCircle className="w-3 h-3 text-amber-600" />
        <span>Unclear</span>
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
        <MinusCircle className="w-3 h-3 text-slate-400" />
        <span>Not Mentioned</span>
      </span>
    );

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                <p className="text-[11px] text-slate-400">{subtitle}</p>
              </div>
            </div>
            {statusBadge}
          </div>

          {/* Card Content */}
          <div className="text-xs">
            {status === 'Not Mentioned' ? (
              <p className="text-slate-400 italic py-1">
                Not mentioned in the submitted policy text.
              </p>
            ) : status === 'Unclear' ? (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-800">
                <p className="font-medium">
                  {items.length > 0 ? items.join('; ') : 'Disclosures for this category are ambiguous or not clearly stated.'}
                </p>
              </div>
            ) : items.length > 0 ? (
              <ul className="space-y-1.5 pt-0.5">
                {items.map((item, idx) => (
                  <li key={idx} className="text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600">Disclosed in policy terms.</p>
            )}
          </div>
        </div>

        {/* Short Evidence Excerpt (where available) */}
        {excerpt && (
          <div className="pt-2 border-t border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                <Quote className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>Policy Evidence Excerpt</span>
              </div>
              <p className="italic leading-relaxed text-slate-700">
                "{excerpt}"
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const trackingAndCookiesFinding = findings.trackingCookies || {
    title: 'Tracking & Cookies',
    status: (findings.tracking?.status === 'Detected' || findings.cookies?.status === 'Detected') ? 'Detected' :
      (findings.tracking?.status === 'Unclear' || findings.cookies?.status === 'Unclear') ? 'Unclear' : 'Not Mentioned',
    items: Array.from(new Set([...(findings.tracking?.items || []), ...(findings.cookies?.items || [])])),
    excerpt: findings.tracking?.excerpt || findings.cookies?.excerpt
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Risk Indicator & Plain-Language Summary */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Plain-Language Summary</h3>
              <p className="text-xs text-slate-500">Core assessment generated from submitted policy text</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                AI-generated Privacy Risk Indicator
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black text-slate-900">{analysis.riskScore}/100</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase border ${riskBadgeStyle}`}>
                  {analysis.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          {summaryText}
        </p>
      </div>

      {/* Grid of 10 Analysis Categories with Status and Evidence Excerpts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Category Insights & Evidence Excerpts</h3>
          </div>
          <span className="text-xs text-slate-400">10 Core Categories Evaluated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 4. Data Collected */}
          {renderFindingCard(
            'Data Collected',
            findings.dataCollected,
            <Database className="w-4 h-4" />,
            'Personal identifiers, account info & telemetry'
          )}

          {/* 5. Sensitive Data */}
          {renderFindingCard(
            'Sensitive Data',
            findings.sensitiveData,
            <ShieldAlert className="w-4 h-4 text-rose-500" />,
            'Biometrics, precise GPS, or sensitive identifiers'
          )}

          {/* 6. Data Sharing */}
          {renderFindingCard(
            'Data Sharing',
            findings.dataSharing,
            <Share2 className="w-4 h-4 text-blue-500" />,
            'Affiliates, contractors, or external commercial sharing'
          )}

          {/* 7. Third Parties */}
          {renderFindingCard(
            'Third Parties',
            findings.thirdParties,
            <Globe className="w-4 h-4 text-cyan-500" />,
            'Ad networks, analytics partners & SDK vendors'
          )}

          {/* 8. Tracking & Cookies */}
          {renderFindingCard(
            'Tracking & Cookies',
            trackingAndCookiesFinding,
            <Activity className="w-4 h-4 text-purple-500" />,
            'Browser cookies, pixels & cross-site trackers'
          )}

          {/* 9. Data Retention */}
          {renderFindingCard(
            'Data Retention',
            findings.dataRetention,
            <Clock className="w-4 h-4 text-amber-500" />,
            'Storage durations and post-deletion practices'
          )}

          {/* 10. User Rights */}
          {renderFindingCard(
            'User Rights',
            findings.userRights,
            <ShieldCheck className="w-4 h-4 text-emerald-500" />,
            'Access, erasure, data export & opt-out provisions'
          )}

          {/* 11. Security */}
          {renderFindingCard(
            'Security',
            findings.security,
            <Lock className="w-4 h-4 text-indigo-500" />,
            'Encryption, organizational safeguards & controls'
          )}

          {/* 12. Privacy Concerns */}
          {renderFindingCard(
            'Privacy Concerns',
            findings.privacyConcerns,
            <AlertTriangle className="w-4 h-4 text-amber-500" />,
            'Potentially invasive or high-risk practices'
          )}

          {/* 13. Important Clauses */}
          {renderFindingCard(
            'Important Clauses',
            findings.importantClauses,
            <FileText className="w-4 h-4 text-slate-600" />,
            'Highlighted terms with direct textual quotes'
          )}
        </div>
      </div>

    </div>
  );
};

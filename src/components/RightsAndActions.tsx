import React from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Sliders, 
  Trash2, 
  DownloadCloud, 
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { PolicyAnalysis } from '../types';

interface RightsAndActionsProps {
  analysis: PolicyAnalysis;
}

export const RightsAndActions: React.FC<RightsAndActionsProps> = ({ analysis }) => {
  const { serviceName, optOutGuidance } = analysis;

  const steps = optOutGuidance?.steps || (analysis as any).rightsAndActions?.optOutSteps || [
    {
      step: 1,
      action: 'Disable Personalized Advertising',
      description: 'Check in-app privacy settings to turn off third-party ad profiling and interest-based recommendations.'
    },
    {
      step: 2,
      action: 'Restrict Mobile Sensor & Location Permissions',
      description: 'Set device location permission to "Never" or "While Using", and disable microphone or clipboard access if not strictly needed.'
    },
    {
      step: 3,
      action: 'Download Personal Data Archive',
      description: 'Use the account data export tool to inspect what data the service has logged on your account.'
    }
  ];

  const hasExport = optOutGuidance?.hasDataDownloadTool ?? (analysis as any).rightsAndActions?.hasDataDownloadTool ?? true;
  const hasDelete = optOutGuidance?.hasAccountDeletionOption ?? (analysis as any).rightsAndActions?.hasAccountDeletionOption ?? true;

  return (
    <div className="space-y-6">
      
      {/* Overview of Available Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <Sliders className="w-4 h-4" />
          <span>User Controls & Privacy Options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <DownloadCloud className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Data Export</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {hasExport ? 'Self-Service Download' : 'Support Request'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Account Deletion</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {hasDelete ? 'Direct In-App Option' : 'Manual Ticket Required'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Ad Personalization</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                Toggle in Settings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Opt-Out Steps */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recommended Opt-Out & Tracking Reduction Steps
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Practical configuration steps you can take inside {serviceName} to limit unnecessary tracking.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {steps.map((step: any) => (
            <div
              key={step.step}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {step.step}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{step.action}</h4>
                  {step.directUrl && (
                    <a
                      href={step.directUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>Settings Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Informational Guidance:</strong> Settings and menu labels in {serviceName} may change over time as the provider updates their user interface. PrivacyLens is an informational analyzer, not a legal advisor or legal service.
        </span>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Sliders, 
  Bot 
} from 'lucide-react';
import { PolicyAnalysis } from '../types';
import { ScorecardHeader } from './ScorecardHeader';
import { ExecutiveSummary } from './ExecutiveSummary';
import { RedFlagsList } from './RedFlagsList';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RightsAndActions } from './RightsAndActions';
import { PrivacyAssistantChat } from './PrivacyAssistantChat';

interface AnalysisDetailViewProps {
  analysis: PolicyAnalysis;
  onBackToDashboard: () => void;
  onOpenCompare: () => void;
}

export const AnalysisDetailView: React.FC<AnalysisDetailViewProps> = ({
  analysis,
  onBackToDashboard,
  onOpenCompare
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'clauses' | 'guidance' | 'chat'>('overview');

  const clausesCount = (analysis.importantClauses || analysis.redFlags || []).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Visual Scorecard Top Banner */}
      <ScorecardHeader
        analysis={analysis}
        onBackToDashboard={onBackToDashboard}
        onOpenCompare={onOpenCompare}
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
        <button
          id="tab-overview-btn"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Privacy Overview</span>
        </button>

        <button
          id="tab-details-btn"
          onClick={() => setActiveTab('details')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'details'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Detailed Analysis</span>
        </button>

        <button
          id="tab-clauses-btn"
          onClick={() => setActiveTab('clauses')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'clauses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Important Clauses</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-600">
            {clausesCount}
          </span>
        </button>

        <button
          id="tab-guidance-btn"
          onClick={() => setActiveTab('guidance')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'guidance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Opt-Out Guidance</span>
        </button>

        <button
          id="tab-chat-btn"
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          <span>AI Assistant</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <ExecutiveSummary analysis={analysis} />
        )}

        {activeTab === 'details' && (
          <CategoryBreakdown analysis={analysis} />
        )}

        {activeTab === 'clauses' && (
          <RedFlagsList redFlags={analysis.importantClauses || analysis.redFlags} serviceName={analysis.serviceName} />
        )}

        {activeTab === 'guidance' && (
          <RightsAndActions analysis={analysis} />
        )}

        {activeTab === 'chat' && (
          <PrivacyAssistantChat analysis={analysis} />
        )}
      </div>

    </div>
  );
};

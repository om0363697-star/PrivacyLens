import React, { useState, useMemo } from 'react';
import { 
  Search, 
  PlusCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Scale, 
  ArrowRight, 
  Activity, 
  FileText,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Lock,
  LogIn,
  Loader2,
  Sparkles,
  History,
  RotateCw,
  Calendar,
  ExternalLink,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { PolicyAnalysis, RiskLevel, UserProfile } from '../types';

interface DashboardViewProps {
  policies: PolicyAnalysis[];
  onSelectPolicy: (policy: PolicyAnalysis) => void;
  onOpenNewAnalysis: () => void;
  onDeletePolicy: (id: string, e: React.MouseEvent) => void;
  onCompareWith: (policy: PolicyAnalysis) => void;
  user?: UserProfile;
  onSignInWithGoogle?: () => void;
  isAuthLoading?: boolean;
  userHistory?: PolicyAnalysis[];
  isHistoryLoading?: boolean;
  historyError?: string | null;
  onRefreshHistory?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  policies,
  onSelectPolicy,
  onOpenNewAnalysis,
  onDeletePolicy,
  onCompareWith,
  user,
  onSignInWithGoogle,
  isAuthLoading = false,
  userHistory = [],
  isHistoryLoading = false,
  historyError = null,
  onRefreshHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewScope, setViewScope] = useState<'ALL' | 'CUSTOM'>('ALL');

  // Compute metrics:
  // - Policies Analyzed
  // - Average Risk Indicator
  // - High Risk Policies
  // - Analysis Time Saved
  const totalPolicies = policies.length;
  const avgRiskScore = totalPolicies > 0 
    ? Math.round(policies.reduce((acc, p) => acc + (p.riskScore ?? (100 - (p as any).overallScore)), 0) / totalPolicies)
    : 0;

  const averageRiskIndicator = avgRiskScore >= 66 ? 'High' : avgRiskScore >= 36 ? 'Moderate' : 'Low';
  
  const highRiskCount = policies.filter(p => p.riskLevel === 'High').length;
  const highRiskPercentage = totalPolicies > 0 ? Math.round((highRiskCount / totalPolicies) * 100) : 0;
  
  const totalMinutesSaved = policies.reduce((acc, p) => acc + p.readingTimeMinutesSaved, 0);

  const categories = useMemo(() => {
    const set = new Set<string>();
    policies.forEach(p => set.add(p.serviceCategory));
    return Array.from(set);
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = 
        p.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.companyName && p.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.serviceCategory === categoryFilter;
      const matchesScope = viewScope === 'ALL' || !p.id.startsWith('sample-');

      return matchesSearch && matchesRisk && matchesCategory && matchesScope;
    });
  }, [policies, searchQuery, riskFilter, categoryFilter, viewScope]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Policy Analysis Dashboard
            </h1>
            {user?.isLoggedIn && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Protected Vault
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review analyzed privacy policies, risk indicators, and important clause extractions.
          </p>
        </div>

        <button
          id="dashboard-new-analysis-btn"
          onClick={onOpenNewAnalysis}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Analyze a Policy</span>
        </button>
      </div>

      {/* Protected Experience Banner */}
      {user?.isLoggedIn ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-lg shadow-indigo-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {user.name}&apos;s Protected Policy Vault
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Cloud Synced
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Authenticated as <span className="font-semibold text-white">{user.email}</span> • Isolated by UID in Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setViewScope(viewScope === 'ALL' ? 'CUSTOM' : 'ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                viewScope === 'CUSTOM'
                  ? 'bg-white text-indigo-900 border-white font-bold'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              {viewScope === 'CUSTOM' ? 'Showing My Custom Analyses' : 'Filter My Custom Analyses'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Unlock Your Personal Policy Vault & Analysis History
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Sign in with Google to protect your audit history, sync analyses across devices, and store records in Firestore.
              </p>
            </div>
          </div>

          {onSignInWithGoogle && (
            <button
              id="dashboard-signin-cta-btn"
              onClick={onSignInWithGoogle}
              disabled={isAuthLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTICATED USER: RECENT ANALYSIS HISTORY (FIRESTORE) */}
      {/* ========================================================================= */}
      {user?.isLoggedIn && (
        <section id="recent-analysis-history-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Recent Analysis History</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    Firestore Cloud
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Your private, UID-isolated policy audits stored securely in Firestore
                </p>
              </div>
            </div>

            {onRefreshHistory && (
              <button
                id="refresh-history-btn"
                onClick={onRefreshHistory}
                disabled={isHistoryLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Sync latest analyses from Firestore"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isHistoryLoading ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden sm:inline">Refresh History</span>
              </button>
            )}
          </div>

          {/* Loading State */}
          {isHistoryLoading && userHistory.length === 0 && (
            <div 
              id="history-loading-state"
              className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-3 shadow-xs"
            >
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Loading your analysis history...</p>
              <p className="text-xs text-slate-400">Fetching protected records from Firestore</p>
            </div>
          )}

          {/* Error State */}
          {historyError && (
            <div 
              id="history-error-state"
              className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-900">Unable to load Firestore history</p>
                <p className="mt-0.5 text-rose-700">{historyError}</p>
              </div>
              {onRefreshHistory && (
                <button
                  onClick={onRefreshHistory}
                  className="px-3 py-1 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg font-semibold text-rose-700 cursor-pointer"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isHistoryLoading && !historyError && userHistory.length === 0 && (
            <div 
              id="history-empty-state"
              className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No previous analyses saved yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When you analyze a privacy policy, the complete analysis report will be automatically saved to your private Firestore vault here.
                </p>
              </div>
              <button
                id="history-empty-analyze-btn"
                onClick={onOpenNewAnalysis}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Analyze Your First Policy</span>
              </button>
            </div>
          )}

          {/* History List Table / Cards */}
          {userHistory.length > 0 && (
            <div 
              id="history-list-container"
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100"
            >
              <div className="hidden sm:grid sm:grid-cols-12 px-5 py-3 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span className="col-span-5">Company / Policy</span>
                <span className="col-span-3">Analysis Date</span>
                <span className="col-span-2 text-center">Risk Assessment</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {userHistory.map((item) => {
                const isLow = item.riskLevel === 'Low';
                const isModerate = item.riskLevel === 'Moderate';
                const riskBadgeClass = isLow 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : isModerate 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200';

                const formattedDate = item.analyzedAt 
                  ? new Date(item.analyzedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Recent';

                return (
                  <div 
                    key={`history-${item.id}`}
                    id={`history-row-${item.id}`}
                    className="p-4 sm:px-5 sm:py-3.5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Company / Policy Name */}
                    <div className="sm:col-span-5 flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                        {item.serviceName ? item.serviceName.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {item.serviceName}
                          </h4>
                          {item.serviceCategory && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate">
                              {item.serviceCategory}
                            </span>
                          )}
                        </div>
                        {item.oneSentenceVerdict && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {item.oneSentenceVerdict}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="sm:col-span-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>

                    {/* Risk Score & Level */}
                    <div className="sm:col-span-2 flex items-center sm:justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${riskBadgeClass}`}>
                        <span>{item.riskLevel}</span>
                        <span className="opacity-75 font-mono">({item.riskScore}/100)</span>
                      </span>
                    </div>

                    {/* View Report Button */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-2">
                      <button
                        id={`view-report-btn-${item.id}`}
                        onClick={() => onSelectPolicy(item)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Reopen complete saved analysis report"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={(e) => onDeletePolicy(item.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Product Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Policies Analyzed</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalPolicies}</p>
          <p className="text-[11px] text-slate-400 mt-1">Stored in active workspace</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Risk Indicator</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{averageRiskIndicator}</span>
            <span className="text-xs text-slate-400 font-bold">({avgRiskScore}/100)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Informational AI assessment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">High Risk Policies</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{highRiskCount}</span>
            <span className="text-xs text-slate-400 font-medium">({highRiskPercentage}%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Heavy tracking or biometrics</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Analysis Time Saved</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{Math.round(totalMinutesSaved / 60 * 10) / 10}</span>
            <span className="text-sm font-semibold text-slate-600">hrs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">~{totalMinutesSaved} minutes of legal text</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="policy-search-input"
            type="text"
            placeholder="Search by service name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Risk:</span>
          {(['ALL', 'Low', 'Moderate', 'High'] as const).map((level) => {
            const isSelected = riskFilter === level;
            return (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {level === 'ALL' ? 'All Risks' : `${level} Risk`}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            id="category-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Section Header with Demo Data Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-slate-900">Policies Overview</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
            {filteredPolicies.length} {filteredPolicies.length === 1 ? 'Policy' : 'Policies'}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Showing analyzed policies with AI Privacy Risk Indicators.
        </p>
      </div>

      {/* Policies Grid */}
      {filteredPolicies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching policies found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {viewScope === 'CUSTOM'
              ? "You haven't run any custom policy analyses yet. Click 'Analyze a Policy' to examine any terms or privacy agreement."
              : "Try adjusting your search criteria or analyze a new privacy policy."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {viewScope === 'CUSTOM' && (
              <button
                onClick={() => setViewScope('ALL')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                View All Policies
              </button>
            )}
            <button
              onClick={onOpenNewAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Analyze a Policy
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((policy) => {
            const isLow = policy.riskLevel === 'Low';
            const isModerate = policy.riskLevel === 'Moderate';

            const badgeColor = isLow 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : isModerate 
              ? 'bg-amber-50 text-amber-700 border-amber-300' 
              : 'bg-rose-50 text-rose-700 border-rose-300';

            return (
              <div
                key={policy.id}
                onClick={() => onSelectPolicy(policy)}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {policy.serviceCategory}
                        </span>
                        {policy.id.startsWith('sample-') ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold">
                            Sample
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            Custom Analysis
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                        {policy.serviceName}
                      </h3>
                      {policy.companyName && (
                        <p className="text-xs text-slate-500">{policy.companyName}</p>
                      )}
                    </div>

                    {/* Risk Badge */}
                    <div className={`px-2.5 py-1.5 rounded-xl flex flex-col items-center justify-center font-black border ${badgeColor}`}>
                      <span className="text-xs uppercase">{policy.riskLevel}</span>
                      <span className="text-[10px] font-bold opacity-80">{policy.riskScore}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {policy.oneSentenceVerdict}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {(policy.importantClauses || policy.redFlags || []).slice(0, 2).map((c) => (
                      <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${
                          c.severity === 'critical' ? 'text-rose-500' : 'text-amber-500'
                        }`} />
                        <span className="truncate">{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Saved ~{policy.readingTimeMinutesSaved}m
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompareWith(policy);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Compare this policy"
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => onDeletePolicy(policy.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Delete from workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Privacy risk indicators are generated by AI for informational understanding and do not constitute formal legal counsel.
        </span>
      </div>

    </div>
  );
};

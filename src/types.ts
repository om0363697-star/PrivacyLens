export type RiskLevel = 'Low' | 'Moderate' | 'High';

export type Severity = 'critical' | 'warning' | 'info';

export type FindingStatus = 'Detected' | 'Not Mentioned' | 'Unclear';

export interface CategoryFinding {
  title: string;
  status: FindingStatus;
  items: string[];
  excerpt?: string;
  explanation?: string;
}

export interface PolicyFindings {
  dataCollected: CategoryFinding;
  sensitiveData: CategoryFinding;
  dataSharing: CategoryFinding;
  thirdParties: CategoryFinding;
  tracking: CategoryFinding;
  cookies: CategoryFinding;
  trackingCookies?: CategoryFinding;
  dataRetention: CategoryFinding;
  userRights: CategoryFinding;
  security: CategoryFinding;
  privacyConcerns: CategoryFinding;
  importantClauses: CategoryFinding;
}

export interface RedFlag {
  id: string;
  title: string;
  severity: Severity;
  category: 'Data Sale' | 'Biometrics' | 'AI Training' | 'Telemetry & Tracking' | 'Data Retention' | 'Children & Minors' | 'Third-Party Sharing' | 'Personal Identifiers' | string;
  clauseExcerpt: string;
  explanation: string;
  riskImpact: string;
}

export interface CategoryScore {
  category: string;
  score: number; // 0 - 100 risk score
  status: 'Good' | 'Moderate' | 'Poor';
  icon: string;
  highlights: string[];
  concerns: string[];
}

export interface OptOutStep {
  step: number;
  action: string;
  description: string;
  directUrl?: string;
}

export interface PolicyAnalysis {
  id: string;
  serviceName: string;
  companyName?: string;
  serviceCategory: 'Social Media' | 'AI & Machine Learning' | 'Productivity & Video' | 'Entertainment & Music' | 'FinTech & Payments' | 'E-Commerce' | 'Other' | string;
  policyUrl?: string;
  analyzedAt: string;
  readingTimeMinutesSaved: number;
  wordCount: number;
  riskScore: number; // 0 - 100 AI-generated Privacy Risk Indicator
  riskLevel: RiskLevel; // 'Low' | 'Moderate' | 'High'
  oneSentenceVerdict: string;
  disclaimer: string;
  plainLanguageSummary?: string;
  findings?: PolicyFindings;
  executiveSummary: {
    dataCollected: string[];
    dataShared: string[];
    userControls: string[];
    humanReadableSummary: string;
  };
  importantClauses: RedFlag[];
  redFlags: RedFlag[]; // backwards compatibility
  categoryBreakdown: CategoryScore[];
  dataRetention: {
    retainedAfterAccountDeletion: boolean;
    retentionPeriod: string;
    summary: string;
  };
  thirdPartySharing: {
    sellsDataToBrokers: boolean;
    sharesWithAdvertisers: boolean;
    sharesWithAffiliates: boolean;
    governmentDisclosurePolicy: string;
    identifiedPartners: string[];
  };
  optOutGuidance: {
    hasDataDownloadTool: boolean;
    hasAccountDeletionOption: boolean;
    steps: OptOutStep[];
  };
  rawPolicyExcerpt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relevantClauses?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
}

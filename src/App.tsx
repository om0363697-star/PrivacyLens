import React, { useState, useEffect, useCallback } from 'react';
import { SAMPLE_POLICIES } from './data/samplePolicies';
import { PolicyAnalysis, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { AnalysisDetailView } from './components/AnalysisDetailView';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { PolicyComparisonModal } from './components/PolicyComparisonModal';
import { AuthModal } from './components/AuthModal';
import { 
  subscribeToAuthState, 
  signInWithGoogle, 
  signOutUser, 
  savePolicyToFirestore, 
  getUserPoliciesFromFirestore,
  deletePolicyFromFirestore
} from './lib/firebase';

const normalizePolicyScores = (list: PolicyAnalysis[]): PolicyAnalysis[] => {
  return list.map(p => {
    if (p.id === 'sample-tiktok' || p.serviceName.toLowerCase().includes('tiktok')) {
      return { ...p, riskScore: 82, riskLevel: 'High' };
    }
    if (p.id === 'sample-openai' || p.serviceName.toLowerCase().includes('openai') || p.serviceName.toLowerCase().includes('chatgpt')) {
      return { ...p, riskScore: 48, riskLevel: 'Moderate' };
    }
    if (p.id === 'sample-signal' || p.serviceName.toLowerCase().includes('signal')) {
      return { ...p, riskScore: 8, riskLevel: 'Low' };
    }
    if (p.id === 'sample-zoom' || p.serviceName.toLowerCase().includes('zoom')) {
      return { ...p, riskScore: 54, riskLevel: 'Moderate' };
    }
    if (p.id === 'sample-spotify' || p.serviceName.toLowerCase().includes('spotify')) {
      return { ...p, riskScore: 42, riskLevel: 'Moderate' };
    }
    const score = typeof p.riskScore === 'number' && !isNaN(p.riskScore) ? p.riskScore : 50;
    const level = p.riskLevel || (score >= 66 ? 'High' : score <= 35 ? 'Low' : 'Moderate');
    return { ...p, riskScore: score, riskLevel: level };
  });
};

export default function App() {
  // Load saved policies from localStorage or use rich pre-loaded samples
  const [policies, setPolicies] = useState<PolicyAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem('privacylens_policies_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizePolicyScores(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved policies', e);
    }
    return normalizePolicyScores(SAMPLE_POLICIES);
  });

  // User session state maintained by Firebase Auth across page refreshes
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('privacylens_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      id: '',
      name: '',
      email: '',
      isLoggedIn: false
    };
  });

  // Analysis History specific state
  const [userHistory, setUserHistory] = useState<PolicyAnalysis[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; code?: string; needsConfiguration?: boolean } | null>(null);

  // Active view state
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'analysis' | 'compare'>('landing');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyAnalysis | null>(null);

  // Modals state
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState<PolicyAnalysis | undefined>(undefined);

  // Fetch authenticated user's analysis history from Firestore
  const fetchUserHistory = useCallback(async (userId: string) => {
    if (!userId) {
      setUserHistory([]);
      return;
    }
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const cloudPolicies = await getUserPoliciesFromFirestore(userId);
      setUserHistory(cloudPolicies);
      
      // Also ensure policies state has these custom policies available
      if (cloudPolicies.length > 0) {
        setPolicies(prev => {
          const cloudIds = new Set(cloudPolicies.map(c => c.id));
          const nonCloudSamples = prev.filter(p => !cloudIds.has(p.id));
          return [...cloudPolicies, ...nonCloudSamples];
        });
      }
    } catch (err: any) {
      console.error('Error fetching user history from Firestore:', err);
      setHistoryError(err?.message || 'Could not load analysis records from Firestore.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Subscribe to Firebase Auth state on mount to maintain session across refreshes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUserProfile) => {
      if (firebaseUserProfile) {
        setUser(firebaseUserProfile);
        try {
          localStorage.setItem('privacylens_user', JSON.stringify(firebaseUserProfile));
        } catch (e) {}

        // Load user's saved policies from Firestore cloud storage
        fetchUserHistory(firebaseUserProfile.id);
      } else {
        setUser({
          id: '',
          name: '',
          email: '',
          isLoggedIn: false
        });
        setUserHistory([]);
        try {
          localStorage.removeItem('privacylens_user');
        } catch (e) {}
      }
    });

    return () => unsubscribe();
  }, [fetchUserHistory]);

  // Save policies to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('privacylens_policies_v2', JSON.stringify(policies));
    } catch (e) {}
  }, [policies]);

  // Handlers
  const handleSelectPolicy = (policy: PolicyAnalysis) => {
    setSelectedPolicy(policy);
    setCurrentView('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = async (newAnalysis: PolicyAnalysis) => {
    // 1. Immediately update local state
    setPolicies(prev => [newAnalysis, ...prev.filter(p => p.id !== newAnalysis.id)]);
    setSelectedPolicy(newAnalysis);
    setCurrentView('analysis');
    setIsNewAnalysisOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. If authenticated, immediately save analysis record to Firestore associated with Firebase UID
    if (user.isLoggedIn && user.id) {
      // Optimistically add to user history
      setUserHistory(prev => [newAnalysis, ...prev.filter(h => h.id !== newAnalysis.id)]);
      try {
        const saved = await savePolicyToFirestore(user.id, newAnalysis);
        if (saved) {
          // Re-fetch or keep optimistic item
          fetchUserHistory(user.id);
        }
      } catch (err) {
        console.warn('Background cloud policy sync failed:', err);
      }
    }
  };

  const handleDeletePolicy = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPolicies(prev => prev.filter(p => p.id !== id));
    setUserHistory(prev => prev.filter(p => p.id !== id));
    
    if (selectedPolicy?.id === id) {
      setSelectedPolicy(null);
      setCurrentView('dashboard');
    }

    // Also delete from Firestore if authenticated and this is a custom user record
    if (user.isLoggedIn && user.id && !id.startsWith('sample-')) {
      try {
        await deletePolicyFromFirestore(user.id, id);
      } catch (err) {
        console.warn('Failed to delete policy from Firestore:', err);
      }
    }
  };

  const handleCompareWith = (policy: PolicyAnalysis) => {
    setCompareTarget(policy);
    setIsCompareOpen(true);
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setAuthError({
          message: result.error,
          code: result.code,
          needsConfiguration: result.needsConfiguration
        });
        setIsAuthOpen(true);
      } else if (result.user) {
        setUser(result.user);
        setIsAuthOpen(false);
        fetchUserHistory(result.user.id);
      }
    } catch (err: any) {
      setAuthError({
        message: err?.message || 'Failed to sign in with Google.',
        code: 'unknown'
      });
      setIsAuthOpen(true);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {}
    setUser({
      id: '',
      name: '',
      email: '',
      isLoggedIn: false
    });
    setUserHistory([]);
    try {
      localStorage.removeItem('privacylens_user');
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewAnalysis={() => setIsNewAnalysisOpen(true)}
        onOpenCompare={() => {
          setCompareTarget(selectedPolicy || policies[0]);
          setIsCompareOpen(true);
        }}
        user={user}
        isAuthLoading={isAuthLoading}
        onSignInWithGoogle={handleGoogleSignIn}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        hasActiveAnalysis={Boolean(selectedPolicy)}
        activeServiceName={selectedPolicy?.serviceName}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onSelectSample={handleSelectPolicy}
            onOpenNewAnalysis={() => setIsNewAnalysisOpen(true)}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            policies={policies}
            onSelectPolicy={handleSelectPolicy}
            onOpenNewAnalysis={() => setIsNewAnalysisOpen(true)}
            onDeletePolicy={handleDeletePolicy}
            onCompareWith={handleCompareWith}
            user={user}
            onSignInWithGoogle={handleGoogleSignIn}
            isAuthLoading={isAuthLoading}
            userHistory={userHistory}
            isHistoryLoading={isHistoryLoading}
            historyError={historyError}
            onRefreshHistory={() => user.id && fetchUserHistory(user.id)}
          />
        )}

        {currentView === 'analysis' && selectedPolicy && (
          <AnalysisDetailView
            analysis={selectedPolicy}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenCompare={() => {
              setCompareTarget(selectedPolicy);
              setIsCompareOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <NewAnalysisModal
        isOpen={isNewAnalysisOpen}
        onClose={() => setIsNewAnalysisOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        onSelectSample={(sample) => {
          setSelectedPolicy(sample);
          setCurrentView('analysis');
          setIsNewAnalysisOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <PolicyComparisonModal
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setCompareTarget(undefined);
        }}
        policies={policies}
        initialPolicy={compareTarget}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthError(null);
        }}
        user={user}
        isAuthLoading={isAuthLoading}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
        authError={authError}
        onClearError={() => setAuthError(null)}
      />

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PrivacyLens</span>
            <span>•</span>
            <span>See what your data really means</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 2.5 Flash</span>
            <span>•</span>
            <span>Informational AI Assessment • Not Legal Advice</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

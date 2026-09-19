import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  setDoc, 
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { UserProfile, PolicyAnalysis } from '../types';

// Static import of provisioned Firebase config
import configJson from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId,
  firestoreDatabaseId: configJson.firestoreDatabaseId || '(default)'
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Persistence
try {
  setPersistence(auth, browserLocalPersistence).catch((e) => {
    console.warn('Firebase auth persistence warning:', e);
  });
} catch (e) {
  console.warn('Unable to set auth persistence:', e);
}

// Initialize Firestore with robust WebChannel long-polling fallback to prevent [code=unavailable] in sandboxed/proxy iframe environments
const databaseId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = (() => {
  try {
    const firestoreSettings = {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    };
    if (databaseId) {
      return initializeFirestore(app, firestoreSettings, databaseId);
    }
    return initializeFirestore(app, firestoreSettings);
  } catch (initErr) {
    // If already initialized, get instance
    if (databaseId) {
      return getFirestore(app, databaseId);
    }
    return getFirestore(app);
  }
})();

/**
 * Format a FirebaseUser into PrivacyLens UserProfile
 */
export function formatUserProfile(fbUser: FirebaseUser): UserProfile {
  return {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'PrivacyLens Researcher',
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || undefined,
    isLoggedIn: true
  };
}

/**
 * Safely store or update user profile in Firestore
 * Does NOT store any passwords or sensitive credentials
 */
export async function syncUserProfileToFirestore(fbUser: FirebaseUser): Promise<UserProfile> {
  const profile = formatUserProfile(fbUser);
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(
      userDocRef,
      {
        id: fbUser.uid,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl || null,
        lastLoginAt: new Date().toISOString(),
        authProvider: 'google.com'
      },
      { merge: true }
    );
  } catch (err) {
    // Graceful fallback if Firestore connection is offline/unavailable
    console.warn('Profile sync to Firestore note (running in offline/resilient mode):', err);
  }
  return profile;
}

export interface AuthResult {
  user: UserProfile | null;
  error?: string;
  code?: string;
  needsConfiguration?: boolean;
}

/**
 * Trigger Google Sign-In popup with graceful error handling
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    if (credential.user) {
      const profile = await syncUserProfileToFirestore(credential.user);
      return { user: profile };
    }
    return { user: null };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    const code = error?.code || 'auth/unknown';
    const message = error?.message || 'Authentication failed';

    if (code === 'auth/popup-closed-by-user') {
      return {
        user: null,
        code,
        error: 'Google Sign-In was cancelled before completion. You can try again whenever you are ready.'
      };
    }

    if (code === 'auth/cancelled-popup-request') {
      return {
        user: null,
        code,
        error: 'Another sign-in window was already open. Please complete or close it and try again.'
      };
    }

    if (code === 'auth/popup-blocked') {
      return {
        user: null,
        code,
        error: 'The sign-in popup was blocked by your browser. Please allow popups for PrivacyLens and try again.'
      };
    }

    if (code === 'auth/operation-not-allowed') {
      return {
        user: null,
        code,
        needsConfiguration: true,
        error: 'Google Sign-In is not enabled yet in this Firebase project. In the Firebase Console, go to Authentication > Sign-in method, click Google, and enable it.'
      };
    }

    if (code === 'auth/unauthorized-domain') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return {
        user: null,
        code,
        needsConfiguration: true,
        error: `Domain "${hostname}" is not authorized for OAuth in Firebase. Add this domain in Firebase Console > Authentication > Settings > Authorized domains.`
      };
    }

    return {
      user: null,
      code,
      error: message
    };
  }
}

/**
 * Sign out user from Firebase Auth
 */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
  }
}

/**
 * Subscribe to Firebase Auth state changes
 */
export function subscribeToAuthState(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const profile = formatUserProfile(fbUser);
      callback(profile);
      // Attempt background profile update without blocking
      syncUserProfileToFirestore(fbUser).catch(() => {});
    } else {
      callback(null);
    }
  });
}

/**
 * Strips rawPolicyExcerpt and trims fields to keep stored analysis minimal,
 * preventing storage of unnecessarily large original full policy text,
 * while preserving all fields needed to fully view and interact with the report.
 */
export function sanitizeAnalysisForStorage(policy: PolicyAnalysis): Partial<PolicyAnalysis> {
  return {
    id: policy.id,
    serviceName: policy.serviceName,
    companyName: policy.companyName || '',
    serviceCategory: policy.serviceCategory,
    policyUrl: policy.policyUrl || '',
    analyzedAt: policy.analyzedAt || new Date().toISOString(),
    readingTimeMinutesSaved: policy.readingTimeMinutesSaved || 0,
    wordCount: policy.wordCount || 0,
    riskScore: policy.riskScore,
    riskLevel: policy.riskLevel,
    oneSentenceVerdict: policy.oneSentenceVerdict,
    disclaimer: policy.disclaimer,
    plainLanguageSummary: policy.plainLanguageSummary || '',
    findings: policy.findings,
    executiveSummary: policy.executiveSummary,
    importantClauses: policy.importantClauses || policy.redFlags || [],
    redFlags: policy.redFlags || policy.importantClauses || [],
    categoryBreakdown: policy.categoryBreakdown || [],
    dataRetention: policy.dataRetention,
    thirdPartySharing: policy.thirdPartySharing,
    optOutGuidance: policy.optOutGuidance
    // NOTE: Intentionally omits `rawPolicyExcerpt` to minimize stored user data
  };
}

/**
 * Save user policy analysis to Firestore protected cloud storage with offline fallback.
 * Associated with the authenticated user's Firebase UID.
 */
export async function savePolicyToFirestore(userId: string, policy: PolicyAnalysis): Promise<boolean> {
  if (!userId) return false;

  // Always cache to user-specific localStorage first for instantaneous offline/resilient access
  try {
    const localKey = `privacylens_history_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updated = [policy, ...existing.filter((p: PolicyAnalysis) => p.id !== policy.id)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (localErr) {
    console.warn('Local cache write note:', localErr);
  }

  try {
    const cleanAnalysis = sanitizeAnalysisForStorage(policy);
    const policyDocRef = doc(db, 'userPolicies', `${userId}_${policy.id}`);
    
    await setDoc(
      policyDocRef,
      {
        id: policy.id,
        userId: userId,
        serviceName: policy.serviceName,
        companyName: policy.companyName || '',
        serviceCategory: policy.serviceCategory,
        riskScore: policy.riskScore,
        riskLevel: policy.riskLevel,
        readingTimeMinutesSaved: policy.readingTimeMinutesSaved,
        oneSentenceVerdict: policy.oneSentenceVerdict,
        analyzedAt: policy.analyzedAt || new Date().toISOString(),
        analysisData: JSON.stringify(cleanAnalysis),
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Firestore cloud sync pending/offline, locally preserved:', err);
    return false;
  }
}

/**
 * Retrieve authenticated user's saved policy analysis history from Firestore with offline cache fallback.
 * Strictly queries records where userId == authenticated userId.
 */
export async function getUserPoliciesFromFirestore(userId: string): Promise<PolicyAnalysis[]> {
  if (!userId) return [];

  // 1. Read local cache for immediate availability
  let cachedRecords: PolicyAnalysis[] = [];
  try {
    const localKey = `privacylens_history_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      cachedRecords = JSON.parse(raw);
    }
  } catch (e) {}

  try {
    const colRef = collection(db, 'userPolicies');
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: PolicyAnalysis[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userId === userId) {
        if (data.analysisData) {
          try {
            const parsed = JSON.parse(data.analysisData);
            results.push(parsed as PolicyAnalysis);
            return;
          } catch (e) {
            console.warn('JSON parse fallback for analysisData:', e);
          }
        }
        // Legacy fallback if stored under policyData
        if (data.policyData) {
          try {
            const parsed = JSON.parse(data.policyData);
            results.push(parsed as PolicyAnalysis);
          } catch (e) {}
        }
      }
    });

    // Sort descending by analyzedAt / createdAt
    results.sort((a, b) => {
      const dateA = new Date(a.analyzedAt || 0).getTime();
      const dateB = new Date(b.analyzedAt || 0).getTime();
      return dateB - dateA;
    });

    // If cloud results found, update the local cache
    if (results.length > 0) {
      try {
        localStorage.setItem(`privacylens_history_${userId}`, JSON.stringify(results));
      } catch (e) {}
      return results;
    }

    // If cloud was empty but we have local records, return local records
    return cachedRecords;
  } catch (err: any) {
    const isOfflineOrUnavailable = 
      err?.code === 'unavailable' || 
      err?.message?.includes('unavailable') || 
      err?.message?.includes('the client is offline') ||
      err?.message?.includes('Connection failed');

    if (isOfflineOrUnavailable) {
      console.warn('Firestore backend currently offline/unavailable; serving local cached policy history:', err);
      return cachedRecords;
    }
    
    // For other errors, return cached records if available, otherwise rethrow
    if (cachedRecords.length > 0) {
      console.warn('Error fetching cloud policies, falling back to local vault:', err);
      return cachedRecords;
    }
    throw err;
  }
}

/**
 * Delete a user's policy analysis record from Firestore and local cache
 */
export async function deletePolicyFromFirestore(userId: string, policyId: string): Promise<boolean> {
  if (!userId || !policyId) return false;

  try {
    const localKey = `privacylens_history_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((p: PolicyAnalysis) => p.id !== policyId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (e) {}

  try {
    const policyDocRef = doc(db, 'userPolicies', `${userId}_${policyId}`);
    await deleteDoc(policyDocRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete policy from Firestore:', err);
    return false;
  }
}

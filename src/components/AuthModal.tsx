import React from 'react';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { firebaseConfig } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isAuthLoading: boolean;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => void;
  authError?: { message: string; code?: string; needsConfiguration?: boolean } | null;
  onClearError?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  isAuthLoading,
  onSignInWithGoogle,
  onSignOut,
  authError,
  onClearError
}) => {
  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="auth-modal-content"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {user.isLoggedIn ? 'Account & Cloud Vault' : 'Sign In with Google'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {user.isLoggedIn ? 'Authenticated Firebase Session' : 'Secure authentication powered by Firebase'}
              </p>
            </div>
          </div>

          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {user.isLoggedIn ? (
            /* Authenticated User View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-600 text-white font-bold text-lg flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 truncate">{user.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{user.email}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">UID: {user.id}</p>
                </div>
              </div>

              {/* Cloud Sync Information */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-500" />
                    Firestore Cloud Vault
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your policy analyses, reading metrics, and risk assessments are securely linked to your Google UID in project <code className="bg-slate-200/70 px-1 py-0.5 rounded text-[10px] font-mono text-slate-800">{firebaseConfig.projectId}</code>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  id="auth-modal-signout-btn"
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Google</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Sign-In View */
            <div className="space-y-5">
              
              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">
                  Welcome to PrivacyLens
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Sign in with your Google Account to unlock your personal policy audit vault, track data exposure across services, and maintain analyses across all devices.
                </p>
              </div>

              {/* Primary Google Sign-In Action */}
              <button
                id="modal-google-signin-btn"
                type="button"
                onClick={onSignInWithGoogle}
                disabled={isAuthLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-lg bg-white text-indigo-700 flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                      G
                    </div>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              {/* Error Callout (Graceful error handling) */}
              {authError && (
                <div 
                  id="auth-error-banner"
                  className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-amber-900 leading-tight">Authentication Notice</p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        {authError.message}
                      </p>
                    </div>
                    {onClearError && (
                      <button 
                        onClick={onClearError} 
                        className="text-amber-500 hover:text-amber-700 text-xs p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Specific help for Firebase Console configuration if needed */}
                  {authError.needsConfiguration && (
                    <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-950 space-y-1 font-mono">
                      <p className="font-bold font-sans text-amber-900">Firebase Console Steps:</p>
                      <p>1. Open <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} target="_blank" rel="noreferrer" className="underline font-bold text-indigo-700">Firebase Authentication Console</a></p>
                      <p>2. In <strong>Sign-in method</strong>, enable <strong>Google</strong></p>
                      {currentHost && (
                        <p>3. In <strong>Settings &gt; Authorized domains</strong>, add: <code className="bg-amber-100 px-1 py-0.5 rounded">{currentHost}</code></p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Privacy & Security Assurances */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Zero Password Storage:</span>
                    <span className="text-slate-500 ml-1">PrivacyLens never creates, asks for, or stores passwords. Authentication is handled securely through Google's OAuth 2.0 flow.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Protected Firestore Cloud:</span>
                    <span className="text-slate-500 ml-1">Your privacy audits and analyzed policies are stored under your personal Google account UID with strict security rules.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

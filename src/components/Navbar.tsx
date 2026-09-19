import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  PlusCircle, 
  LayoutDashboard, 
  Scale, 
  Sparkles, 
  User, 
  LogOut, 
  LogIn,
  Loader2, 
  ChevronDown, 
  ShieldCheck, 
  CloudCheck, 
  ExternalLink 
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'analysis' | 'compare';
  onNavigate: (view: 'landing' | 'dashboard' | 'analysis' | 'compare') => void;
  onOpenNewAnalysis: () => void;
  onOpenCompare: () => void;
  user: UserProfile;
  isAuthLoading?: boolean;
  onSignInWithGoogle: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  hasActiveAnalysis: boolean;
  activeServiceName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNewAnalysis,
  onOpenCompare,
  user,
  isAuthLoading = false,
  onSignInWithGoogle,
  onOpenAuth,
  onSignOut,
  hasActiveAnalysis,
  activeServiceName
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Privacy<span className="text-indigo-600">Lens</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  AI Policy Analyzer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                See what your data really means
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
              {user.isLoggedIn && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Protected Workspace Active"></span>
              )}
            </button>

            {hasActiveAnalysis && (
              <button
                id="nav-active-analysis-btn"
                onClick={() => onNavigate('analysis')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentView === 'analysis'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>{activeServiceName || 'Current Report'}</span>
              </button>
            )}

            <button
              id="nav-compare-btn"
              onClick={onOpenCompare}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'compare'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Compare Policies</span>
            </button>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* AI Status badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini 2.5 Flash Engine</span>
          </div>

          {/* New Analysis Primary Button */}
          <button
            id="navbar-new-analysis-btn"
            onClick={onOpenNewAnalysis}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Analysis</span>
          </button>

          {/* User Profile / Google Authentication Area */}
          {user.isLoggedIn ? (
            <div className="relative pl-2 border-l border-slate-200" ref={menuRef}>
              {/* Profile Trigger Button */}
              <button
                id="user-profile-menu-trigger"
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer border border-transparent hover:border-slate-200 text-left"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                {/* User Photo / Initials */}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-slate-300 shadow-xs shrink-0">
                  {user.avatarUrl && !imageLoadError ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={() => setImageLoadError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>

                {/* User Name */}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium leading-tight flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Protected</span>
                  </p>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User Card Header */}
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-indigo-600 text-white font-bold text-sm flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
                      {user.avatarUrl && !imageLoadError ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{userInitials}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Google Authenticated
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-1">
                    <button
                      id="menu-protected-dashboard-btn"
                      onClick={() => {
                        onNavigate('dashboard');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="leading-tight font-semibold">Protected Policy Vault</p>
                        <p className="text-[10px] text-slate-400 font-normal">View encrypted analyses & history</p>
                      </div>
                    </button>

                    <button
                      id="menu-open-auth-details-btn"
                      onClick={() => {
                        onOpenAuth();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="leading-tight font-semibold">Security & Sync Details</p>
                        <p className="text-[10px] text-slate-400 font-normal">Firebase Auth & Firestore status</p>
                      </div>
                    </button>
                  </div>

                  {/* Sign Out Option */}
                  <div className="pt-2 px-2 border-t border-slate-100">
                    <button
                      id="menu-signout-btn"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                id="navbar-signin-btn"
                onClick={onSignInWithGoogle}
                disabled={isAuthLoading}
                className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-slate-800 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-lg transition-all cursor-pointer border border-slate-200/80 disabled:opacity-60"
                title="Sign in with Google using Firebase Authentication"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

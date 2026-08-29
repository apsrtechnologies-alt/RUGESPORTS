import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { triggerGoogleOAuthPopup, renderGoogleButton, decodeGoogleCredential, GOOGLE_CLIENT_ID } from '../services/googleAuth';
import { X, ShieldCheck, Gamepad2, User, Phone, Sparkles, AlertCircle, Mail, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'google_prompt'>(authModalMode);
  
  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  
  // Register form
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [freeFireName, setFreeFireName] = useState('');
  const [freeFireUid, setFreeFireUid] = useState('');
  const [email, setEmail] = useState('');

  // Google Quick Auth form fallback
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googleFfUidInput, setGoogleFfUidInput] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Sync mode with prop when opened
  useEffect(() => {
    if (authModalMode === 'login' || authModalMode === 'register') {
      setMode(authModalMode);
    }
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  // Attempt to render official Google Identity Button whenever modal opens
  useEffect(() => {
    if (isAuthModalOpen && googleBtnContainerRef.current) {
      const timer = setTimeout(() => {
        if (googleBtnContainerRef.current) {
          renderGoogleButton(
            googleBtnContainerRef.current,
            async (credential) => {
              try {
                setIsGoogleLoading(true);
                setError(null);
                const profile = decodeGoogleCredential(credential);
                await loginWithGoogle({
                  credential,
                  email: profile?.email,
                  name: profile?.name,
                  avatar: profile?.picture,
                  googleId: profile?.sub,
                });
              } catch (err: any) {
                setError(err.message || 'Google Sign-In failed');
              } finally {
                setIsGoogleLoading(false);
              }
            },
            { theme: 'outline', size: 'large', text: 'signin_with' }
          );
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthModalOpen, mode]);

  if (!isAuthModalOpen) return null;

  const handleGooglePopupAuth = () => {
    setError(null);
    setIsGoogleLoading(true);

    triggerGoogleOAuthPopup(
      async (userInfo, accessToken) => {
        try {
          await loginWithGoogle({
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
            googleId: userInfo.sub,
          });
        } catch (err: any) {
          setError(err.message || 'Google Sign-In failed');
        } finally {
          setIsGoogleLoading(false);
        }
      },
      (popupErr) => {
        setIsGoogleLoading(false);
        console.warn('Google Popup result/error:', popupErr);
        // If popup was blocked or closed, gracefully switch to direct email entry
        if (popupErr?.message && !popupErr.message.includes('closed_by_user')) {
          setError(popupErr.message || 'Could not complete Google popup sign in. You can type your Gmail directly below.');
        }
        setMode('google_prompt');
      }
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your phone number, username, or Gmail');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (loginIdentifier.includes('@')) {
        await loginWithGoogle({ email: loginIdentifier.trim() });
      } else {
        await login({ phone: loginIdentifier.trim() });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or register.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !phone.trim() || !freeFireName.trim() || !freeFireUid.trim()) {
      setError('Please fill in all required fields (Username, Phone, FF Name, FF UID).');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        username: username.trim(),
        phone: phone.trim(),
        freeFireName: freeFireName.trim(),
        freeFireUid: freeFireUid.trim(),
        email: email.trim(),
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setError('Please enter a valid Gmail / Google Account address.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle({
        email: googleEmailInput.trim().toLowerCase(),
        name: googleNameInput.trim() || googleEmailInput.split('@')[0],
        freeFireUid: googleFfUidInput.trim(),
      });
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoPhone: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ phone: demoPhone });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="auth-modal-card" 
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-900"
      >
        <button
          id="close-auth-modal-btn"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900 tracking-wide font-['Rajdhani'] leading-tight">
              {mode === 'login' ? 'PLAYER LOGIN' : mode === 'register' ? 'CREATE PLAYER PROFILE' : 'GOOGLE / GMAIL SIGN IN'}
            </h3>
            <p className="text-xs text-orange-600 font-bold">RUG | ESPORTS (rugesports.in)</p>
          </div>
        </div>

        {/* Official Google 1-Tap OAuth Button */}
        {mode !== 'google_prompt' && (
          <div className="space-y-2.5 mb-4">
            <button
              id="google-signin-popup-btn"
              type="button"
              onClick={handleGooglePopupAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2.5 shadow-xs active:scale-[0.98] disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
            </button>

            {/* Rendered Google GSI button slot if loaded */}
            <div ref={googleBtnContainerRef} className="flex justify-center empty:hidden" />

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">or use phone / username</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>
        )}

        {/* Tab switch */}
        {mode !== 'google_prompt' && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mb-4 border border-slate-200">
            <button
              id="tab-switch-login"
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                mode === 'login' 
                  ? 'bg-orange-500 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-switch-register"
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition ${
                mode === 'register' 
                  ? 'bg-orange-500 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New
            </button>
          </div>
        )}

        {error && (
          <div className="mb-3.5 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* MODE: GOOGLE PROMPT / DIRECT GMAIL */}
        {mode === 'google_prompt' ? (
          <form onSubmit={handleGoogleDirectSubmit} className="space-y-3.5 animate-fadeIn">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant Google Account Authentication</span>
              </div>
              <p className="text-[11px] text-blue-700/80 leading-snug">
                Enter your Gmail address to sign in or create a player profile instantly with 0 password hassle.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Gmail Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. player@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gamer Name / In-Game Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. RUG_BOSS, ProKiller"
                value={googleNameInput}
                onChange={(e) => setGoogleNameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-md shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In with Gmail'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number, Username, or Gmail
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identifier-input"
                  type="text"
                  placeholder="e.g. 9876543210 or your_username"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-md shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Logging in...' : 'Sign In to Arena'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Test Logins */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                ⚡ Quick Demo Accounts (1-Click Test)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('9876543210')}
                  className="p-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 rounded-xl text-left text-xs transition"
                >
                  <div className="font-bold text-slate-800">PhoenixFF</div>
                  <div className="text-[10px] text-slate-500">₹450 Wallet</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('9811223344')}
                  className="p-2 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 rounded-xl text-left text-xs transition"
                >
                  <div className="font-bold text-slate-800">ShadowNinja</div>
                  <div className="text-[10px] text-slate-500">₹820 Wallet</div>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Portal Username *
              </label>
              <input
                id="register-username-input"
                type="text"
                required
                placeholder="e.g. ProGamer99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (WhatsApp) *
                </label>
                <input
                  id="register-phone-input"
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email (Optional)
                </label>
                <input
                  id="register-email-input"
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1">
                <Gamepad2 className="w-3 h-3 text-amber-700" />
                Free Fire In-Game Identity
              </span>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Free Fire In-Game Name (IGN) *
                </label>
                <input
                  id="register-ff-name-input"
                  type="text"
                  required
                  placeholder="Exact IGN shown in Free Fire"
                  value={freeFireName}
                  onChange={(e) => setFreeFireName(e.target.value)}
                  className="w-full bg-white border border-amber-300 focus:border-orange-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Free Fire UID (Account ID) *
                </label>
                <input
                  id="register-ff-uid-input"
                  type="text"
                  required
                  placeholder="e.g. 1829384729"
                  value={freeFireUid}
                  onChange={(e) => setFreeFireUid(e.target.value)}
                  className="w-full bg-white border border-amber-300 focus:border-orange-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition font-mono"
                />
              </div>
            </div>

            <button
              id="submit-register-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-md shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% Secure & Fair Play Guaranteed • Official rugesports.in
          </p>
        </div>
      </div>
    </div>
  );
};

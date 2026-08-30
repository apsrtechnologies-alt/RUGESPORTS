import React, { useRef } from 'react';
import { User, Wallet, Bell, Sparkles } from 'lucide-react';
import { UserProfile, PublicSettings } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  publicSettings: PublicSettings;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenAdminSecret: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  publicSettings,
  onOpenWallet,
  onOpenNotifications,
  onOpenAuth,
  onOpenAdminSecret,
  unreadNotificationsCount = 0,
}) => {
  // Secret admin unlock: 3 fast taps on the brand logo
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretLogoClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onOpenAdminSecret();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 700);
    }
  };

  const formattedBalance = user ? user.walletBalance.toLocaleString('en-IN') : '0';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all duration-200">
      {/* Main Header Row */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* RUG ESPORTS Brand Logo (Freely displayed image, Secret Admin Trigger on 3 taps) */}
        <div 
          id="brand-logo-trigger"
          onClick={handleSecretLogoClick}
          className="flex items-center cursor-pointer select-none group active:scale-95 transition"
          title="RUG ESPORTS (Admin: 3 taps)"
        >
          <img 
            src="https://krorent.in/wp-content/uploads/2026/08/RUGESPORTS.jpeg" 
            alt="RUG ESPORTS" 
            className="h-10 sm:h-11 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right side: Wallet + Notifications */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Wallet Pill Button */}
              <button
                id="header-wallet-btn"
                onClick={onOpenWallet}
                className="group relative flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-3 h-3 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-orange-100">₹</span>
                  <span className="text-xs font-bold tracking-tight">{formattedBalance}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </button>

              {/* Notification Bell */}
              <button
                id="header-notification-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
              </button>
            </>
          ) : (
            <>
              {/* Sign In CTA */}
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Ticker for System Announcements if enabled */}
      {publicSettings.systemAnnouncement && (
        <div className="bg-orange-50 border-t border-orange-100 px-4 py-1.5 text-[11px] text-orange-800 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="truncate font-medium">{publicSettings.systemAnnouncement}</span>
          </div>
        </div>
      )}
    </header>
  );
};
